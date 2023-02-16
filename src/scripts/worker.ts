const worker = () => {
  setTimeout(function live() {
    postMessage('live')
    setTimeout(live, 1000)
  }, 1000)
}

export const playerWorker = new Blob([`(${worker.toString()})()`], {
  type: 'text/javascript',
})
