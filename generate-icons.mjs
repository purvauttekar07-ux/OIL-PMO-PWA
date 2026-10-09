// Simple script to create placeholder icon PNGs using canvas
// Run with: node generate-icons.mjs
import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'

function createIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // Background
  ctx.fillStyle = '#0f172a'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.2)
  ctx.fill()
  
  // Orange square
  ctx.fillStyle = '#ea580c'
  const pad = size * 0.12
  ctx.beginPath()
  ctx.roundRect(pad, pad, size - pad * 2, size - pad * 2, size * 0.15)
  ctx.fill()
  
  // Text
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${size * 0.28}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('OIL', size / 2, size * 0.47)
  ctx.font = `${size * 0.13}px Inter, sans-serif`
  ctx.fillText('PMO', size / 2, size * 0.68)
  
  return canvas.toBuffer('image/png')
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', createIcon(192))
writeFileSync('public/icons/icon-512.png', createIcon(512))
console.log('Icons generated!')
