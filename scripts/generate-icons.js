const fs = require('fs')
const zlib = require('zlib')
const path = require('path')

function createChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  const crc = zlib.crc32(Buffer.concat([typeBuf, data]))
  crcBuf.writeUInt32BE(crc >>> 0, 0