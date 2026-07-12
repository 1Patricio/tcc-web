function htmlParaTextoPuro(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent?.trim() ?? div.innerText?.trim() ?? ''
}

export async function copiarConteudoFormatado(html: string): Promise<void> {
  const textoPuro = htmlParaTextoPuro(html)
  const item = new ClipboardItem({
    'text/html': new Blob(
      [`<!DOCTYPE html><html><body>${html}</body></html>`],
      { type: 'text/html' },
    ),
    'text/plain': new Blob([textoPuro], { type: 'text/plain' }),
  })
  await navigator.clipboard.write([item])
}
