import type { ClientModule } from 'claude-code'

// A see-through region laid over the pet's drawing: a press on it is a press
// on the pet, which the hooks module hears as a `ui.message`.
const PetPress: ClientModule = (_props, surface) => {
  const { Box } = surface.elements
  surface.onPointer(event => {
    if (event.type === 'down') surface.post({ pressed: true })
  })

  return <Box width="100%" height="100%" />
}

export default PetPress
