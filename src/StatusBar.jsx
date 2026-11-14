import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Activity, Lock, Radio } from 'lucide-react'

const healthApi = axios.create({ baseURL: '/api/poc-ce', timeout: 8000 })

export default function StatusBar({ mtlsStatus = {}, onHeartbeatClick }) {
  const [wsStatus, setWsStatus] = useState('connecting')
  const [apiState, setApiState] = useState({
    ok: null,
    latencyMs: null,
    lastChecked: null
  })

  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const mountedRef = useRef(true)

  const checkApiHeartbeat = useCallback(async () => {
    const start = performance.now()
    try {
      await healthApi.get('/health')
      const latencyMs = Math.max(1, Math.round(performance.now() - start))
      if (mountedRef.current) {
        setApiState({
          ok: true,
          latencyMs,
          lastChecked: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        })
      }
    } catch {
      if (mountedRef.current) {
        setApiState({
          ok: false,
          latencyMs: null,
          lastChecked: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        })
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    checkApiHeartbeat()
    const heartbeatTimer = setInterval(checkApiHeartbeat, 15000)

    function connectWebSocket() {
      if (!mountedRef.current) return
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${protocol}//${window.location.host}/api/poc-ce/ws`
        setWsStatus('connecting')
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          if (mountedRef.current) setWsStatus('connected')
        }
        ws.onmessage = () => {
          if (mountedRef.current) setWsStatus('connected')
        }
        ws.onerror = () => {
          if (mountedRef.current) setWsStatus('disconnected')
        }
        ws.onclose = () => {
          if (!mountedRef.current) return
          setWsStatus('disconnected')
          reconnectTimerRef.current = setTimeout(connectWebSocket, 5000)
        }
      } catch {
        if (mountedRef.current) setWsStatus('disconnected')
      }
    }

    connectWebSocket()

    return () => {
      mountedRef.current = false
      clearInterval(heartbeatTimer)
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (wsRef.current) {
        try {
          wsRef.current.close()
        } catch {
          // Ignore close errors
        }
      }
    }
  }, [checkApiHeartbeat])

  const mtlsOk = Boolean(mtlsStatus.mtlsConectado)
  const mtlsFailed = !mtlsOk && Boolean(mtlsStatus.erro)

  return (
    <div
      role="region"
      aria-label="Telemetria de conectividade em tempo real"
      className="inline-flex flex-wrap items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] font-mono tabular-nums"
    >
      {/* 1. Saúde mTLS */}
      <div
        title={
          mtlsStatus.erro ||
          mtlsStatus.certificado ||
          'Handshake mTLS com certificado e-CNPJ A1 ICP-Brasil'
        }
        className="flex items-center gap-1.5 pr-2 border-r border-[var(--border-subtle)] whitespace-nowrap"
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            mtlsOk ? 'bg-[var(--semantic-success-text)]' : mtlsFailed ? 'bg-[var(--semantic-danger-text)]' : 'bg-amber-400'
          }`}
        />
        <Lock
          className={`w-3 h-3 shrink-0 ${
            mtlsOk
              ? 'text-[var(--semantic-success-text)]'
              : mtlsFailed
              ? 'text-[var(--semantic-danger-text)]'
              : 'text-[var(--semantic-warning-text)]'
          }`}
        />
        <span className="text-[var(--text-muted)]">mTLS:</span>
        <span
          className={`font-semibold ${
            mtlsOk
              ? 'text-[var(--semantic-success-text)]'
              : mtlsFailed
              ? 'text-[var(--semantic-danger-text)]'
              : 'text-[var(--semantic-warning-text)]'
          }`}
        >
          {mtlsOk ? `HTTP ${mtlsStatus.status || 200}` : mtlsFailed ? 'FALHA' : 'SYNC'}
        </span>
      </div>

      {/* 2. Saúde WebSocket */}
      <div
        title={`Canal WebSocket (/api/poc-ce/ws): ${
          wsStatus === 'connected'
            ? 'Conectado'
            : wsStatus === 'connecting'
            ? 'Estabelecendo conexão'
            : 'Desconectado (reconectando)'
        }`}
        className="flex items-center gap-1.5 pr-2 border-r border-[var(--border-subtle)] whitespace-nowrap"
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            wsStatus === 'connected'
              ? 'bg-[var(--semantic-success-text)]'
              : wsStatus === 'connecting'
              ? 'bg-amber-400 animate-pulse'
              : 'bg-[var(--semantic-danger-text)]'
          }`}
        />
        <Radio
          className={`w-3 h-3 shrink-0 ${
            wsStatus === 'connected'
              ? 'text-[var(--semantic-success-text)]'
              : wsStatus === 'connecting'
              ? 'text-[var(--semantic-warning-text)]'
              : 'text-[var(--semantic-danger-text)]'
          }`}
        />
        <span className="text-[var(--text-muted)]">WS:</span>
        <span
          className={`font-semibold ${
            wsStatus === 'connected'
              ? 'text-[var(--semantic-success-text)]'
              : wsStatus === 'connecting'
              ? 'text-[var(--semantic-warning-text)]'
              : 'text-[var(--semantic-danger-text)]'
          }`}
        >
          {wsStatus === 'connected' ? 'ATIVO' : wsStatus === 'connecting' ? 'SYNC' : 'OFF'}
        </span>
      </div>

      {/* 3. Heartbeat da API */}
      <button
        type="button"
        onClick={() => {
          checkApiHeartbeat()
          if (onHeartbeatClick) onHeartbeatClick()
        }}
        title={
          apiState.lastChecked
            ? `Último heartbeat às ${apiState.lastChecked} · Clique para testar agora`
            : 'Verificar heartbeat da API'
        }
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity whitespace-nowrap"
      >
        <Activity
          className={`w-3 h-3 shrink-0 ${
            apiState.ok === true
              ? 'text-[var(--semantic-success-text)]'
              : apiState.ok === false
              ? 'text-[var(--semantic-danger-text)]'
              : 'text-[var(--semantic-warning-text)]'
          }`}
        />
        <span className="text-[var(--text-muted)]">API:</span>
        <span
          className={`font-semibold ${
            apiState.ok === true
              ? 'text-[var(--semantic-success-text)]'
              : apiState.ok === false
              ? 'text-[var(--semantic-danger-text)]'
              : 'text-[var(--semantic-warning-text)]'
          }`}
        >
          {apiState.ok === true ? `${apiState.latencyMs}ms` : apiState.ok === false ? 'OFF' : '...'}
        </span>
      </button>
    </div>
  )
}
