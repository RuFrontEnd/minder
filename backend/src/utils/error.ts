const getError = (err: unknown) => {
  if (typeof err === "string") {
    return err.toUpperCase()
  } else if (err instanceof Error) {
    return err.message
  }
}

export { getError }