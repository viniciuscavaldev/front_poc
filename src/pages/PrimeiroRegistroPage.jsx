import React from 'react'
import PrimeiroRegistroOficial from '../PrimeiroRegistroOficial'

export default function PrimeiroRegistroPage({ onAtualizarDashboard, onProgressChange }) {
  return (
    <PrimeiroRegistroOficial
      onAtualizarDashboard={onAtualizarDashboard}
      onProgressChange={onProgressChange}
    />
  )
}
