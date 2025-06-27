# Reaction Sound Effects

The application uses Web Audio API to generate reaction sounds programmatically.

## Sound Mapping

Each reaction has a unique sound:

- **👍 Like** - Quick high-pitched beep (C5, 0.1s)
- **👏 Clap** - Double burst sound mimicking clapping (E5, 0.15s)
- **😂 Laugh** - Oscillating frequency for laughter effect (A4, 0.3s)
- **🤔 Thinking** - Low thoughtful hum (F4, 0.4s)
- **🎉 Celebrate** - Ascending celebratory sound (G5, 0.2s)
- **❤️ Love** - Warm mid-tone (F5, 0.25s)
- **🔥 Fire** - Sharp energetic tone (D5, 0.15s)
- **😱 Shocked** - Low dramatic tone (D4, 0.3s)

## Technical Details

- Uses Web Audio API oscillators
- Different waveforms (sine, triangle) for variety
- Volume envelopes for natural sound decay
- Frequency modulation for complex sounds (clap, laugh, celebrate)

## Adding Custom Sound Files

If you prefer to use actual sound files instead of generated sounds:

1. Add `.mp3` or `.wav` files to this directory
2. Name them: `reaction-[type].mp3` (e.g., `reaction-clap.mp3`)
3. Update the ReactionBar component to use `new Audio()` instead of Web Audio API