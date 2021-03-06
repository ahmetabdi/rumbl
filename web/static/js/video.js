import Player from './player'

let Video = {

  init(socket, element) {
    if (!element) { return }
    let playerId = element.getAttribute("data-player-id")
    let videoId = element.getAttribute("data-id")
    socket.connect()
    Player.init(element.id, playerId, () => {
      this.onReady(videoId, socket)
    })
  },

  onReady(videoId, socket) {
    let msgContainer = document.getElementById("msg-container")
    let msgInput = document.getElementById("msg-input")
    let postButton = document.getElementById("msg-submit")
    let vidChannel = socket.channel("videos:" + videoId)

    // Handle the click event when clicking the post button
    postButton.addEventListener("click", e => {
      console.log("postButton clicked", e)
      let payload = {body: msgInput.value, at: Player.getCurrentTime()}
      vidChannel.push("new_annotation", payload)
        .receive("error", e => console.log(e))
      msgInput.value = ""
    })

    vidChannel.on("new_annotation", (resp) => {
      vidChannel.params.last_seen_id = resp.id
      this.renderAnnotation(msgContainer, resp)
    })
    // Join the channel
    vidChannel.join()
      .receive("ok", resp => {
        let ids = resp.annotations.map(ann => ann.id)
        if(ids.length > 0) { vidChannel.params.last_seen_id = Math.max(...ids)}
        resp.annotations.forEach( ann => this.renderAnnotation(msgContainer, ann))
      })
      .receive("error", reason => console.log("join failed", reason))
  },

  esc(str) {
    let div = document.createElement("div")
    div.appendChild(document.createTextNode(str))
    return div.innerHTML
  },

  renderAnnotation(msgContainer, {user, body, at}) {
    let template = document.createElement("div")

    template.innerHTML = `
    <a href="#" data-seek=${this.esc(at)}">
      <b>${this.esc(user.username)}</b>: ${this.esc(body)}
    </a>
    `
    msgContainer.appendChild(template)
    msgContainer.scrollTop = msgContainer.scrollHeight
  }
}

export default Video
