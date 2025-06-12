// Generate a simple notification sound programmatically
// This script creates a simple notification sound using Web Audio API
// and exports it as a base64 data URL that can be used as audio source

function generateNotificationSound() {
  // Create audio context
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Parameters for the notification sound
  const sampleRate = audioContext.sampleRate;
  const duration = 0.3; // 300ms
  const length = sampleRate * duration;
  
  // Create audio buffer
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  
  // Generate a pleasant two-tone notification sound
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    
    // Two-tone beep: 800Hz for first 150ms, 1000Hz for last 150ms
    const freq = t < 0.15 ? 800 : 1000;
    
    // Envelope for smooth start and end
    let envelope = 1;
    if (t < 0.02) {
      envelope = t / 0.02; // Fade in
    } else if (t > 0.25) {
      envelope = (0.3 - t) / 0.05; // Fade out
    }
    
    // Generate sine wave with envelope
    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
  }
  
  return buffer;
}

// Export the function for use in the notification system
export { generateNotificationSound };
