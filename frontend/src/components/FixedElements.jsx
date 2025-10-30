import { useAuthStore } from '../stores/index'

export default function FixedElements() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <>
    </>
  )
}

