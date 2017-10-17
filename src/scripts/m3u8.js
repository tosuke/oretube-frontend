import axios from 'axios'
import config from '../config'

function fetchPlaylists(id) {
  const promises = ['high', 'mid', 'low'].map(name =>
    axios.get(`${config.contentBaseUrl}/${id}/${name}.m3u8`).then(r => r.data)
  )
  return Promise.all(promises)
}

function replaceKeyfile(m3u8, keyfileUrl) {
  return m3u8.replace(/\$keyfile/g, keyfileUrl)
}

function replaceBaseUrl(m3u8, id) {
  return m3u8.replace(/\$baseurl/g, `${config.contentBaseUrl}/${id}`)
}

export function generateUrl(string, type = '') {
  return `data:${type};base64,${btoa(string)}`
  //return URL.createObjectURL(new Blob([string], { type }))
}

export function genMasterPlaylist([high, mid, low]) {
  const type = 'application/x-mpegURL'
  let master = '#EXTM3U\n'
  master +=
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=512000,RESOLUTION=640x360\n'
  master += generateUrl(low, type) + '\n'
  master +=
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2000000,RESOLUTION=1280x720\n'
  master += generateUrl(mid, type) + '\n'
  master +=
    '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=3000000,RESOLUTION=1920x1080\n'
  master += generateUrl(high, type)
  return master
}

export default async function generateValidMasterPlaylistUrl(id, keyfileUrl) {
  const playlists = await fetchPlaylists(id).then(plists =>
    plists
      .map(p => replaceKeyfile(p, keyfileUrl))
      .map(p => replaceBaseUrl(p, id))
  )
  return generateUrl(genMasterPlaylist(playlists), 'application/x-mpegURL')
}