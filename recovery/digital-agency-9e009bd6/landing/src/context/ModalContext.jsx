import { createContext, useContext } from 'react'

export const LeadModalContext = createContext({ open: () => {} })
export const TrialModalContext = createContext({ openTrial: () => {} })

export function useLeadModal() {
  return useContext(LeadModalContext)
}

export function useTrialModal() {
  return useContext(TrialModalContext)
}
