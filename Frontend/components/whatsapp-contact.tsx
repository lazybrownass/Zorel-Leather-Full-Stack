"use client"

import { useState } from "react"

interface WhatsAppContactProps {
  phoneNumber?: string
  message?: string
  className?: string
}

export function WhatsAppFloatingButton({ 
  phoneNumber = "601125427250", 
  message = "Hello! I'm interested in your leather products. Can you help me?",
  className = ""
}: WhatsAppContactProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Format phone number for wa.me link (remove spaces, dashes, and +)
  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[\s\-+]/g, "")
  }

  const whatsappUrl = `https://wa.me/${formatPhoneForWhatsApp(phoneNumber)}?text=${encodeURIComponent(message)}`

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className="relative">
        {/* WhatsApp floating button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center border-2 border-white"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ 
            width: '64px', 
            height: '64px',
            background: '#25D366',
            boxShadow: '0 6px 20px rgba(37, 211, 102, 0.5)',
            animation: 'pulse 2s infinite'
          }}
        >
          {/* WhatsApp SVG Icon */}
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="white"
            className="drop-shadow-sm"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </a>
        
        {/* Tooltip on hover */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-3 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
            <div className="font-medium">Chat with us on WhatsApp</div>
            <div className="text-xs text-gray-300">Click to start a conversation</div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  )
}

// Additional utility function for generating WhatsApp links
export function generateWhatsAppLink(phoneNumber: string, message?: string): string {
  const formattedPhone = phoneNumber.replace(/[\s\-+]/g, "")
  const defaultMessage = "Hello! I'm interested in your leather products. Can you help me?"
  const finalMessage = message || defaultMessage
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(finalMessage)}`
}