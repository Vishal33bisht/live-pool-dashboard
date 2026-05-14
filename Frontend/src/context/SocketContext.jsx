
import { createContext, useEffect, useState } from 'react'
import { createSocket } from '../socket/socket.js'

export const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket] = useState(() => createSocket())

  useEffect(() => {
    socket.connect()
    return () => socket.disconnect()
  }, [socket])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
