import React from 'react'

interface LogoProps {
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ className = "h-16 w-auto" }) => {
  return (
    <svg
      viewBox="0 0 304 150"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(20.86328125 82.277846644773) scale(1 1)">
        <text
          dominantBaseline="auto"
          alignmentBaseline="auto"
          fontFamily="Arial, sans-serif"
          fontSize="62px"
          fontWeight="bold"
          fill="#001315"
          letterSpacing="0"
        >
          COFFICE
        </text>
      </g>
      <g transform="translate(20.86328125 124.89680275144) scale(0.41959570467675 0.41959570467675)">
        <text
          dominantBaseline="auto"
          alignmentBaseline="auto"
          fontFamily="Arial, sans-serif"
          fontSize="34px"
          fill="#58595b"
          letterSpacing="0"
        >
          COWORKING SPACE BY HCC
        </text>
      </g>
    </svg>
  )
}

export default Logo
