
import { useEffect, useState } from 'react'
import { createSocket } from '../socket/socket.js'
import { SocketContext } from './socket-context.js'

export function SocketProvider({ children }) {
  const [socket] = useState(() => createSocket())

  useEffect(() => {
    socket.connect()
    return () => socket.disconnect()
  }, [socket])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
