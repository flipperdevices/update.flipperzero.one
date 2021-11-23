/* eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, camelcase, default-case-last, no-mixed-operators */
import * as $protobuf from 'protobufjs/minimal'

const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util

const $root = $protobuf.roots.default || ($protobuf.roots.default = {})

export const PB_App = $root.PB_App = (() => {
  const PB_App = {}

  PB_App.StartRequest = (function () {
    function StartRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    StartRequest.prototype.name = ''
    StartRequest.prototype.args = ''

    StartRequest.create = function create (properties) {
      return new StartRequest(properties)
    }

    StartRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.name != null && Object.hasOwnProperty.call(message, 'name')) { writer.uint32(10).string(message.name) }
      if (message.args != null && Object.hasOwnProperty.call(message, 'args')) { writer.uint32(18).string(message.args) }
      return writer
    }

    StartRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    StartRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_App.StartRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.name = reader.string()
            break
          case 2:
            message.args = reader.string()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    StartRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    StartRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.name != null && message.hasOwnProperty('name')) {
        if (!$util.isString(message.name)) { return 'name: string expected' }
      }
      if (message.args != null && message.hasOwnProperty('args')) {
        if (!$util.isString(message.args)) { return 'args: string expected' }
      }
      return null
    }

    StartRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_App.StartRequest) { return object }
      const message = new $root.PB_App.StartRequest()
      if (object.name != null) { message.name = String(object.name) }
      if (object.args != null) { message.args = String(object.args) }
      return message
    }

    StartRequest.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) {
        object.name = ''
        object.args = ''
      }
      if (message.name != null && message.hasOwnProperty('name')) { object.name = message.name }
      if (message.args != null && message.hasOwnProperty('args')) { object.args = message.args }
      return object
    }

    StartRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return StartRequest
  })()

  PB_App.LockStatusRequest = (function () {
    function LockStatusRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    LockStatusRequest.create = function create (properties) {
      return new LockStatusRequest(properties)
    }

    LockStatusRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      return writer
    }

    LockStatusRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    LockStatusRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_App.LockStatusRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    LockStatusRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    LockStatusRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      return null
    }

    LockStatusRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_App.LockStatusRequest) { return object }
      return new $root.PB_App.LockStatusRequest()
    }

    LockStatusRequest.toObject = function toObject () {
      return {}
    }

    LockStatusRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return LockStatusRequest
  })()

  PB_App.LockStatusResponse = (function () {
    function LockStatusResponse (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    LockStatusResponse.prototype.locked = false

    LockStatusResponse.create = function create (properties) {
      return new LockStatusResponse(properties)
    }

    LockStatusResponse.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.locked != null && Object.hasOwnProperty.call(message, 'locked')) { writer.uint32(8).bool(message.locked) }
      return writer
    }

    LockStatusResponse.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    LockStatusResponse.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_App.LockStatusResponse()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.locked = reader.bool()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    LockStatusResponse.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    LockStatusResponse.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.locked != null && message.hasOwnProperty('locked')) {
        if (typeof message.locked !== 'boolean') { return 'locked: boolean expected' }
      }
      return null
    }

    LockStatusResponse.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_App.LockStatusResponse) { return object }
      const message = new $root.PB_App.LockStatusResponse()
      if (object.locked != null) { message.locked = Boolean(object.locked) }
      return message
    }

    LockStatusResponse.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) { object.locked = false }
      if (message.locked != null && message.hasOwnProperty('locked')) { object.locked = message.locked }
      return object
    }

    LockStatusResponse.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return LockStatusResponse
  })()

  return PB_App
})()

export const PB = $root.PB = (() => {
  const PB = {}

  PB.CommandStatus = (function () {
    const valuesById = {}, values = Object.create(valuesById)
    values[valuesById[0] = 'OK'] = 0
    values[valuesById[1] = 'ERROR'] = 1
    values[valuesById[2] = 'ERROR_DECODE'] = 2
    values[valuesById[3] = 'ERROR_NOT_IMPLEMENTED'] = 3
    values[valuesById[4] = 'ERROR_BUSY'] = 4
    values[valuesById[14] = 'ERROR_CONTINUOUS_COMMAND_INTERRUPTED'] = 14
    values[valuesById[15] = 'ERROR_INVALID_PARAMETERS'] = 15
    values[valuesById[5] = 'ERROR_STORAGE_NOT_READY'] = 5
    values[valuesById[6] = 'ERROR_STORAGE_EXIST'] = 6
    values[valuesById[7] = 'ERROR_STORAGE_NOT_EXIST'] = 7
    values[valuesById[8] = 'ERROR_STORAGE_INVALID_PARAMETER'] = 8
    values[valuesById[9] = 'ERROR_STORAGE_DENIED'] = 9
    values[valuesById[10] = 'ERROR_STORAGE_INVALID_NAME'] = 10
    values[valuesById[11] = 'ERROR_STORAGE_INTERNAL'] = 11
    values[valuesById[12] = 'ERROR_STORAGE_NOT_IMPLEMENTED'] = 12
    values[valuesById[13] = 'ERROR_STORAGE_ALREADY_OPEN'] = 13
    values[valuesById[18] = 'ERROR_STORAGE_DIR_NOT_EMPTY'] = 18
    values[valuesById[16] = 'ERROR_APP_CANT_START'] = 16
    values[valuesById[17] = 'ERROR_APP_SYSTEM_LOCKED'] = 17
    values[valuesById[19] = 'ERROR_VIRTUAL_DISPLAY_ALREADY_STARTED'] = 19
    values[valuesById[20] = 'ERROR_VIRTUAL_DISPLAY_NOT_STARTED'] = 20
    return values
  })()

  PB.Empty = (function () {
    function Empty (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    Empty.create = function create (properties) {
      return new Empty(properties)
    }

    Empty.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      return writer
    }

    Empty.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    Empty.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.Empty()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    Empty.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    Empty.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      return null
    }

    Empty.fromObject = function fromObject (object) {
      if (object instanceof $root.PB.Empty) { return object }
      return new $root.PB.Empty()
    }

    Empty.toObject = function toObject () {
      return {}
    }

    Empty.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return Empty
  })()

  PB.StopSession = (function () {
    function StopSession (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    StopSession.create = function create (properties) {
      return new StopSession(properties)
    }

    StopSession.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      return writer
    }

    StopSession.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    StopSession.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.StopSession()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    StopSession.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    StopSession.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      return null
    }

    StopSession.fromObject = function fromObject (object) {
      if (object instanceof $root.PB.StopSession) { return object }
      return new $root.PB.StopSession()
    }

    StopSession.toObject = function toObject () {
      return {}
    }

    StopSession.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return StopSession
  })()

  PB.Main = (function () {
    function Main (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    Main.prototype.commandId = 0
    Main.prototype.commandStatus = 0
    Main.prototype.hasNext = false
    Main.prototype.empty = null
    Main.prototype.stopSession = null
    Main.prototype.pingRequest = null
    Main.prototype.pingResponse = null
    Main.prototype.storageStatRequest = null
    Main.prototype.storageStatResponse = null
    Main.prototype.storageListRequest = null
    Main.prototype.storageListResponse = null
    Main.prototype.storageReadRequest = null
    Main.prototype.storageReadResponse = null
    Main.prototype.storageWriteRequest = null
    Main.prototype.storageDeleteRequest = null
    Main.prototype.storageMkdirRequest = null
    Main.prototype.storageMd5sumRequest = null
    Main.prototype.storageMd5sumResponse = null
    Main.prototype.appStartRequest = null
    Main.prototype.appLockStatusRequest = null
    Main.prototype.appLockStatusResponse = null
    Main.prototype.guiStartScreenStreamRequest = null
    Main.prototype.guiStopScreenStreamRequest = null
    Main.prototype.guiScreenFrame = null
    Main.prototype.guiSendInputEventRequest = null
    Main.prototype.guiStartVirtualDisplayRequest = null
    Main.prototype.guiStopVirtualDisplayRequest = null

    let $oneOfFields

    Object.defineProperty(Main.prototype, 'content', {
      get: $util.oneOfGetter($oneOfFields = ['empty', 'stopSession', 'pingRequest', 'pingResponse', 'storageStatRequest', 'storageStatResponse', 'storageListRequest', 'storageListResponse', 'storageReadRequest', 'storageReadResponse', 'storageWriteRequest', 'storageDeleteRequest', 'storageMkdirRequest', 'storageMd5sumRequest', 'storageMd5sumResponse', 'appStartRequest', 'appLockStatusRequest', 'appLockStatusResponse', 'guiStartScreenStreamRequest', 'guiStopScreenStreamRequest', 'guiScreenFrame', 'guiSendInputEventRequest', 'guiStartVirtualDisplayRequest', 'guiStopVirtualDisplayRequest']),
      set: $util.oneOfSetter($oneOfFields)
    })

    Main.create = function create (properties) {
      return new Main(properties)
    }

    Main.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.commandId != null && Object.hasOwnProperty.call(message, 'commandId')) { writer.uint32(8).uint32(message.commandId) }
      if (message.commandStatus != null && Object.hasOwnProperty.call(message, 'commandStatus')) { writer.uint32(16).int32(message.commandStatus) }
      if (message.hasNext != null && Object.hasOwnProperty.call(message, 'hasNext')) { writer.uint32(24).bool(message.hasNext) }
      if (message.empty != null && Object.hasOwnProperty.call(message, 'empty')) { $root.PB.Empty.encode(message.empty, writer.uint32(34).fork()).ldelim() }
      if (message.pingRequest != null && Object.hasOwnProperty.call(message, 'pingRequest')) { $root.PB_Status.PingRequest.encode(message.pingRequest, writer.uint32(42).fork()).ldelim() }
      if (message.pingResponse != null && Object.hasOwnProperty.call(message, 'pingResponse')) { $root.PB_Status.PingResponse.encode(message.pingResponse, writer.uint32(50).fork()).ldelim() }
      if (message.storageListRequest != null && Object.hasOwnProperty.call(message, 'storageListRequest')) { $root.PB_Storage.ListRequest.encode(message.storageListRequest, writer.uint32(58).fork()).ldelim() }
      if (message.storageListResponse != null && Object.hasOwnProperty.call(message, 'storageListResponse')) { $root.PB_Storage.ListResponse.encode(message.storageListResponse, writer.uint32(66).fork()).ldelim() }
      if (message.storageReadRequest != null && Object.hasOwnProperty.call(message, 'storageReadRequest')) { $root.PB_Storage.ReadRequest.encode(message.storageReadRequest, writer.uint32(74).fork()).ldelim() }
      if (message.storageReadResponse != null && Object.hasOwnProperty.call(message, 'storageReadResponse')) { $root.PB_Storage.ReadResponse.encode(message.storageReadResponse, writer.uint32(82).fork()).ldelim() }
      if (message.storageWriteRequest != null && Object.hasOwnProperty.call(message, 'storageWriteRequest')) { $root.PB_Storage.WriteRequest.encode(message.storageWriteRequest, writer.uint32(90).fork()).ldelim() }
      if (message.storageDeleteRequest != null && Object.hasOwnProperty.call(message, 'storageDeleteRequest')) { $root.PB_Storage.DeleteRequest.encode(message.storageDeleteRequest, writer.uint32(98).fork()).ldelim() }
      if (message.storageMkdirRequest != null && Object.hasOwnProperty.call(message, 'storageMkdirRequest')) { $root.PB_Storage.MkdirRequest.encode(message.storageMkdirRequest, writer.uint32(106).fork()).ldelim() }
      if (message.storageMd5sumRequest != null && Object.hasOwnProperty.call(message, 'storageMd5sumRequest')) { $root.PB_Storage.Md5sumRequest.encode(message.storageMd5sumRequest, writer.uint32(114).fork()).ldelim() }
      if (message.storageMd5sumResponse != null && Object.hasOwnProperty.call(message, 'storageMd5sumResponse')) { $root.PB_Storage.Md5sumResponse.encode(message.storageMd5sumResponse, writer.uint32(122).fork()).ldelim() }
      if (message.appStartRequest != null && Object.hasOwnProperty.call(message, 'appStartRequest')) { $root.PB_App.StartRequest.encode(message.appStartRequest, writer.uint32(130).fork()).ldelim() }
      if (message.appLockStatusRequest != null && Object.hasOwnProperty.call(message, 'appLockStatusRequest')) { $root.PB_App.LockStatusRequest.encode(message.appLockStatusRequest, writer.uint32(138).fork()).ldelim() }
      if (message.appLockStatusResponse != null && Object.hasOwnProperty.call(message, 'appLockStatusResponse')) { $root.PB_App.LockStatusResponse.encode(message.appLockStatusResponse, writer.uint32(146).fork()).ldelim() }
      if (message.stopSession != null && Object.hasOwnProperty.call(message, 'stopSession')) { $root.PB.StopSession.encode(message.stopSession, writer.uint32(154).fork()).ldelim() }
      if (message.guiStartScreenStreamRequest != null && Object.hasOwnProperty.call(message, 'guiStartScreenStreamRequest')) { $root.PB_Gui.StartScreenStreamRequest.encode(message.guiStartScreenStreamRequest, writer.uint32(162).fork()).ldelim() }
      if (message.guiStopScreenStreamRequest != null && Object.hasOwnProperty.call(message, 'guiStopScreenStreamRequest')) { $root.PB_Gui.StopScreenStreamRequest.encode(message.guiStopScreenStreamRequest, writer.uint32(170).fork()).ldelim() }
      if (message.guiScreenFrame != null && Object.hasOwnProperty.call(message, 'guiScreenFrame')) { $root.PB_Gui.ScreenFrame.encode(message.guiScreenFrame, writer.uint32(178).fork()).ldelim() }
      if (message.guiSendInputEventRequest != null && Object.hasOwnProperty.call(message, 'guiSendInputEventRequest')) { $root.PB_Gui.SendInputEventRequest.encode(message.guiSendInputEventRequest, writer.uint32(186).fork()).ldelim() }
      if (message.storageStatRequest != null && Object.hasOwnProperty.call(message, 'storageStatRequest')) { $root.PB_Storage.StatRequest.encode(message.storageStatRequest, writer.uint32(194).fork()).ldelim() }
      if (message.storageStatResponse != null && Object.hasOwnProperty.call(message, 'storageStatResponse')) { $root.PB_Storage.StatResponse.encode(message.storageStatResponse, writer.uint32(202).fork()).ldelim() }
      if (message.guiStartVirtualDisplayRequest != null && Object.hasOwnProperty.call(message, 'guiStartVirtualDisplayRequest')) { $root.PB_Gui.StartVirtualDisplayRequest.encode(message.guiStartVirtualDisplayRequest, writer.uint32(210).fork()).ldelim() }
      if (message.guiStopVirtualDisplayRequest != null && Object.hasOwnProperty.call(message, 'guiStopVirtualDisplayRequest')) { $root.PB_Gui.StopVirtualDisplayRequest.encode(message.guiStopVirtualDisplayRequest, writer.uint32(218).fork()).ldelim() }
      return writer
    }

    Main.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    Main.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.Main()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.commandId = reader.uint32()
            break
          case 2:
            message.commandStatus = reader.int32()
            break
          case 3:
            message.hasNext = reader.bool()
            break
          case 4:
            message.empty = $root.PB.Empty.decode(reader, reader.uint32())
            break
          case 19:
            message.stopSession = $root.PB.StopSession.decode(reader, reader.uint32())
            break
          case 5:
            message.pingRequest = $root.PB_Status.PingRequest.decode(reader, reader.uint32())
            break
          case 6:
            message.pingResponse = $root.PB_Status.PingResponse.decode(reader, reader.uint32())
            break
          case 24:
            message.storageStatRequest = $root.PB_Storage.StatRequest.decode(reader, reader.uint32())
            break
          case 25:
            message.storageStatResponse = $root.PB_Storage.StatResponse.decode(reader, reader.uint32())
            break
          case 7:
            message.storageListRequest = $root.PB_Storage.ListRequest.decode(reader, reader.uint32())
            break
          case 8:
            message.storageListResponse = $root.PB_Storage.ListResponse.decode(reader, reader.uint32())
            break
          case 9:
            message.storageReadRequest = $root.PB_Storage.ReadRequest.decode(reader, reader.uint32())
            break
          case 10:
            message.storageReadResponse = $root.PB_Storage.ReadResponse.decode(reader, reader.uint32())
            break
          case 11:
            message.storageWriteRequest = $root.PB_Storage.WriteRequest.decode(reader, reader.uint32())
            break
          case 12:
            message.storageDeleteRequest = $root.PB_Storage.DeleteRequest.decode(reader, reader.uint32())
            break
          case 13:
            message.storageMkdirRequest = $root.PB_Storage.MkdirRequest.decode(reader, reader.uint32())
            break
          case 14:
            message.storageMd5sumRequest = $root.PB_Storage.Md5sumRequest.decode(reader, reader.uint32())
            break
          case 15:
            message.storageMd5sumResponse = $root.PB_Storage.Md5sumResponse.decode(reader, reader.uint32())
            break
          case 16:
            message.appStartRequest = $root.PB_App.StartRequest.decode(reader, reader.uint32())
            break
          case 17:
            message.appLockStatusRequest = $root.PB_App.LockStatusRequest.decode(reader, reader.uint32())
            break
          case 18:
            message.appLockStatusResponse = $root.PB_App.LockStatusResponse.decode(reader, reader.uint32())
            break
          case 20:
            message.guiStartScreenStreamRequest = $root.PB_Gui.StartScreenStreamRequest.decode(reader, reader.uint32())
            break
          case 21:
            message.guiStopScreenStreamRequest = $root.PB_Gui.StopScreenStreamRequest.decode(reader, reader.uint32())
            break
          case 22:
            message.guiScreenFrame = $root.PB_Gui.ScreenFrame.decode(reader, reader.uint32())
            break
          case 23:
            message.guiSendInputEventRequest = $root.PB_Gui.SendInputEventRequest.decode(reader, reader.uint32())
            break
          case 26:
            message.guiStartVirtualDisplayRequest = $root.PB_Gui.StartVirtualDisplayRequest.decode(reader, reader.uint32())
            break
          case 27:
            message.guiStopVirtualDisplayRequest = $root.PB_Gui.StopVirtualDisplayRequest.decode(reader, reader.uint32())
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    Main.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    Main.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      const properties = {}
      if (message.commandId != null && message.hasOwnProperty('commandId')) {
        if (!$util.isInteger(message.commandId)) { return 'commandId: integer expected' }
      }
      if (message.commandStatus != null && message.hasOwnProperty('commandStatus')) {
        switch (message.commandStatus) {
          default:
            return 'commandStatus: enum value expected'
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
          case 14:
          case 15:
          case 5:
          case 6:
          case 7:
          case 8:
          case 9:
          case 10:
          case 11:
          case 12:
          case 13:
          case 18:
          case 16:
          case 17:
          case 19:
          case 20:
            break
        }
      }
      if (message.hasNext != null && message.hasOwnProperty('hasNext')) {
        if (typeof message.hasNext !== 'boolean') { return 'hasNext: boolean expected' }
      }
      if (message.empty != null && message.hasOwnProperty('empty')) {
        properties.content = 1
        {
          const error = $root.PB.Empty.verify(message.empty)
          if (error) { return 'empty.' + error }
        }
      }
      if (message.stopSession != null && message.hasOwnProperty('stopSession')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB.StopSession.verify(message.stopSession)
          if (error) { return 'stopSession.' + error }
        }
      }
      if (message.pingRequest != null && message.hasOwnProperty('pingRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Status.PingRequest.verify(message.pingRequest)
          if (error) { return 'pingRequest.' + error }
        }
      }
      if (message.pingResponse != null && message.hasOwnProperty('pingResponse')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Status.PingResponse.verify(message.pingResponse)
          if (error) { return 'pingResponse.' + error }
        }
      }
      if (message.storageStatRequest != null && message.hasOwnProperty('storageStatRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Storage.StatRequest.verify(message.storageStatRequest)
          if (error) { return 'storageStatRequest.' + error }
        }
      }
      if (message.storageStatResponse != null && message.hasOwnProperty('storageStatResponse')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Storage.StatResponse.verify(message.storageStatResponse)
          if (error) { return 'storageStatResponse.' + error }
        }
      }
      if (message.storageListRequest != null && message.hasOwnProperty('storageListRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Storage.ListRequest.verify(message.storageListRequest)
          if (error) { return 'storageListRequest.' + error }
        }
      }
      if (message.storageListResponse != null && message.hasOwnProperty('storageListResponse')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Storage.ListResponse.verify(message.storageListResponse)
          if (error) { return 'storageListResponse.' + error }
        }
      }
      if (message.storageReadRequest != null && message.hasOwnProperty('storageReadRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Storage.ReadRequest.verify(message.storageReadRequest)
          if (error) { return 'storageReadRequest.' + error }
        }
      }
      if (message.storageReadResponse != null && message.hasOwnProperty('storageReadResponse')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Storage.ReadResponse.verify(message.storageReadResponse)
          if (error) { return 'storageReadResponse.' + error }
        }
      }
      if (message.storageWriteRequest != null && message.hasOwnProperty('storageWriteRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Storage.WriteRequest.verify(message.storageWriteRequest)
          if (error) { return 'storageWriteRequest.' + error }
        }
      }
      if (message.storageDeleteRequest != null && message.hasOwnProperty('storageDeleteRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Storage.DeleteRequest.verify(message.storageDeleteRequest)
          if (error) { return 'storageDeleteRequest.' + error }
        }
      }
      if (message.storageMkdirRequest != null && message.hasOwnProperty('storageMkdirRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Storage.MkdirRequest.verify(message.storageMkdirRequest)
          if (error) { return 'storageMkdirRequest.' + error }
        }
      }
      if (message.storageMd5sumRequest != null && message.hasOwnProperty('storageMd5sumRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Storage.Md5sumRequest.verify(message.storageMd5sumRequest)
          if (error) { return 'storageMd5sumRequest.' + error }
        }
      }
      if (message.storageMd5sumResponse != null && message.hasOwnProperty('storageMd5sumResponse')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Storage.Md5sumResponse.verify(message.storageMd5sumResponse)
          if (error) { return 'storageMd5sumResponse.' + error }
        }
      }
      if (message.appStartRequest != null && message.hasOwnProperty('appStartRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_App.StartRequest.verify(message.appStartRequest)
          if (error) { return 'appStartRequest.' + error }
        }
      }
      if (message.appLockStatusRequest != null && message.hasOwnProperty('appLockStatusRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_App.LockStatusRequest.verify(message.appLockStatusRequest)
          if (error) { return 'appLockStatusRequest.' + error }
        }
      }
      if (message.appLockStatusResponse != null && message.hasOwnProperty('appLockStatusResponse')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_App.LockStatusResponse.verify(message.appLockStatusResponse)
          if (error) { return 'appLockStatusResponse.' + error }
        }
      }
      if (message.guiStartScreenStreamRequest != null && message.hasOwnProperty('guiStartScreenStreamRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Gui.StartScreenStreamRequest.verify(message.guiStartScreenStreamRequest)
          if (error) { return 'guiStartScreenStreamRequest.' + error }
        }
      }
      if (message.guiStopScreenStreamRequest != null && message.hasOwnProperty('guiStopScreenStreamRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Gui.StopScreenStreamRequest.verify(message.guiStopScreenStreamRequest)
          if (error) { return 'guiStopScreenStreamRequest.' + error }
        }
      }
      if (message.guiScreenFrame != null && message.hasOwnProperty('guiScreenFrame')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Gui.ScreenFrame.verify(message.guiScreenFrame)
          if (error) { return 'guiScreenFrame.' + error }
        }
      }
      if (message.guiSendInputEventRequest != null && message.hasOwnProperty('guiSendInputEventRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Gui.SendInputEventRequest.verify(message.guiSendInputEventRequest)
          if (error) { return 'guiSendInputEventRequest.' + error }
        }
      }
      if (message.guiStartVirtualDisplayRequest != null && message.hasOwnProperty('guiStartVirtualDisplayRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Gui.StartVirtualDisplayRequest.verify(message.guiStartVirtualDisplayRequest)
          if (error) { return 'guiStartVirtualDisplayRequest.' + error }
        }
      }
      if (message.guiStopVirtualDisplayRequest != null && message.hasOwnProperty('guiStopVirtualDisplayRequest')) {
        if (properties.content === 1) { return 'content: multiple values' }
        properties.content = 1
        {
          const error = $root.PB_Gui.StopVirtualDisplayRequest.verify(message.guiStopVirtualDisplayRequest)
          if (error) { return 'guiStopVirtualDisplayRequest.' + error }
        }
      }
      return null
    }

    Main.fromObject = function fromObject (object) {
      if (object instanceof $root.PB.Main) { return object }
      const message = new $root.PB.Main()
      if (object.commandId != null) { message.commandId = object.commandId >>> 0 }
      switch (object.commandStatus) {
        case 'OK':
        case 0:
          message.commandStatus = 0
          break
        case 'ERROR':
        case 1:
          message.commandStatus = 1
          break
        case 'ERROR_DECODE':
        case 2:
          message.commandStatus = 2
          break
        case 'ERROR_NOT_IMPLEMENTED':
        case 3:
          message.commandStatus = 3
          break
        case 'ERROR_BUSY':
        case 4:
          message.commandStatus = 4
          break
        case 'ERROR_CONTINUOUS_COMMAND_INTERRUPTED':
        case 14:
          message.commandStatus = 14
          break
        case 'ERROR_INVALID_PARAMETERS':
        case 15:
          message.commandStatus = 15
          break
        case 'ERROR_STORAGE_NOT_READY':
        case 5:
          message.commandStatus = 5
          break
        case 'ERROR_STORAGE_EXIST':
        case 6:
          message.commandStatus = 6
          break
        case 'ERROR_STORAGE_NOT_EXIST':
        case 7:
          message.commandStatus = 7
          break
        case 'ERROR_STORAGE_INVALID_PARAMETER':
        case 8:
          message.commandStatus = 8
          break
        case 'ERROR_STORAGE_DENIED':
        case 9:
          message.commandStatus = 9
          break
        case 'ERROR_STORAGE_INVALID_NAME':
        case 10:
          message.commandStatus = 10
          break
        case 'ERROR_STORAGE_INTERNAL':
        case 11:
          message.commandStatus = 11
          break
        case 'ERROR_STORAGE_NOT_IMPLEMENTED':
        case 12:
          message.commandStatus = 12
          break
        case 'ERROR_STORAGE_ALREADY_OPEN':
        case 13:
          message.commandStatus = 13
          break
        case 'ERROR_STORAGE_DIR_NOT_EMPTY':
        case 18:
          message.commandStatus = 18
          break
        case 'ERROR_APP_CANT_START':
        case 16:
          message.commandStatus = 16
          break
        case 'ERROR_APP_SYSTEM_LOCKED':
        case 17:
          message.commandStatus = 17
          break
        case 'ERROR_VIRTUAL_DISPLAY_ALREADY_STARTED':
        case 19:
          message.commandStatus = 19
          break
        case 'ERROR_VIRTUAL_DISPLAY_NOT_STARTED':
        case 20:
          message.commandStatus = 20
          break
      }
      if (object.hasNext != null) { message.hasNext = Boolean(object.hasNext) }
      if (object.empty != null) {
        if (typeof object.empty !== 'object') { throw TypeError('.PB.Main.empty: object expected') }
        message.empty = $root.PB.Empty.fromObject(object.empty)
      }
      if (object.stopSession != null) {
        if (typeof object.stopSession !== 'object') { throw TypeError('.PB.Main.stopSession: object expected') }
        message.stopSession = $root.PB.StopSession.fromObject(object.stopSession)
      }
      if (object.pingRequest != null) {
        if (typeof object.pingRequest !== 'object') { throw TypeError('.PB.Main.pingRequest: object expected') }
        message.pingRequest = $root.PB_Status.PingRequest.fromObject(object.pingRequest)
      }
      if (object.pingResponse != null) {
        if (typeof object.pingResponse !== 'object') { throw TypeError('.PB.Main.pingResponse: object expected') }
        message.pingResponse = $root.PB_Status.PingResponse.fromObject(object.pingResponse)
      }
      if (object.storageStatRequest != null) {
        if (typeof object.storageStatRequest !== 'object') { throw TypeError('.PB.Main.storageStatRequest: object expected') }
        message.storageStatRequest = $root.PB_Storage.StatRequest.fromObject(object.storageStatRequest)
      }
      if (object.storageStatResponse != null) {
        if (typeof object.storageStatResponse !== 'object') { throw TypeError('.PB.Main.storageStatResponse: object expected') }
        message.storageStatResponse = $root.PB_Storage.StatResponse.fromObject(object.storageStatResponse)
      }
      if (object.storageListRequest != null) {
        if (typeof object.storageListRequest !== 'object') { throw TypeError('.PB.Main.storageListRequest: object expected') }
        message.storageListRequest = $root.PB_Storage.ListRequest.fromObject(object.storageListRequest)
      }
      if (object.storageListResponse != null) {
        if (typeof object.storageListResponse !== 'object') { throw TypeError('.PB.Main.storageListResponse: object expected') }
        message.storageListResponse = $root.PB_Storage.ListResponse.fromObject(object.storageListResponse)
      }
      if (object.storageReadRequest != null) {
        if (typeof object.storageReadRequest !== 'object') { throw TypeError('.PB.Main.storageReadRequest: object expected') }
        message.storageReadRequest = $root.PB_Storage.ReadRequest.fromObject(object.storageReadRequest)
      }
      if (object.storageReadResponse != null) {
        if (typeof object.storageReadResponse !== 'object') { throw TypeError('.PB.Main.storageReadResponse: object expected') }
        message.storageReadResponse = $root.PB_Storage.ReadResponse.fromObject(object.storageReadResponse)
      }
      if (object.storageWriteRequest != null) {
        if (typeof object.storageWriteRequest !== 'object') { throw TypeError('.PB.Main.storageWriteRequest: object expected') }
        message.storageWriteRequest = $root.PB_Storage.WriteRequest.fromObject(object.storageWriteRequest)
      }
      if (object.storageDeleteRequest != null) {
        if (typeof object.storageDeleteRequest !== 'object') { throw TypeError('.PB.Main.storageDeleteRequest: object expected') }
        message.storageDeleteRequest = $root.PB_Storage.DeleteRequest.fromObject(object.storageDeleteRequest)
      }
      if (object.storageMkdirRequest != null) {
        if (typeof object.storageMkdirRequest !== 'object') { throw TypeError('.PB.Main.storageMkdirRequest: object expected') }
        message.storageMkdirRequest = $root.PB_Storage.MkdirRequest.fromObject(object.storageMkdirRequest)
      }
      if (object.storageMd5sumRequest != null) {
        if (typeof object.storageMd5sumRequest !== 'object') { throw TypeError('.PB.Main.storageMd5sumRequest: object expected') }
        message.storageMd5sumRequest = $root.PB_Storage.Md5sumRequest.fromObject(object.storageMd5sumRequest)
      }
      if (object.storageMd5sumResponse != null) {
        if (typeof object.storageMd5sumResponse !== 'object') { throw TypeError('.PB.Main.storageMd5sumResponse: object expected') }
        message.storageMd5sumResponse = $root.PB_Storage.Md5sumResponse.fromObject(object.storageMd5sumResponse)
      }
      if (object.appStartRequest != null) {
        if (typeof object.appStartRequest !== 'object') { throw TypeError('.PB.Main.appStartRequest: object expected') }
        message.appStartRequest = $root.PB_App.StartRequest.fromObject(object.appStartRequest)
      }
      if (object.appLockStatusRequest != null) {
        if (typeof object.appLockStatusRequest !== 'object') { throw TypeError('.PB.Main.appLockStatusRequest: object expected') }
        message.appLockStatusRequest = $root.PB_App.LockStatusRequest.fromObject(object.appLockStatusRequest)
      }
      if (object.appLockStatusResponse != null) {
        if (typeof object.appLockStatusResponse !== 'object') { throw TypeError('.PB.Main.appLockStatusResponse: object expected') }
        message.appLockStatusResponse = $root.PB_App.LockStatusResponse.fromObject(object.appLockStatusResponse)
      }
      if (object.guiStartScreenStreamRequest != null) {
        if (typeof object.guiStartScreenStreamRequest !== 'object') { throw TypeError('.PB.Main.guiStartScreenStreamRequest: object expected') }
        message.guiStartScreenStreamRequest = $root.PB_Gui.StartScreenStreamRequest.fromObject(object.guiStartScreenStreamRequest)
      }
      if (object.guiStopScreenStreamRequest != null) {
        if (typeof object.guiStopScreenStreamRequest !== 'object') { throw TypeError('.PB.Main.guiStopScreenStreamRequest: object expected') }
        message.guiStopScreenStreamRequest = $root.PB_Gui.StopScreenStreamRequest.fromObject(object.guiStopScreenStreamRequest)
      }
      if (object.guiScreenFrame != null) {
        if (typeof object.guiScreenFrame !== 'object') { throw TypeError('.PB.Main.guiScreenFrame: object expected') }
        message.guiScreenFrame = $root.PB_Gui.ScreenFrame.fromObject(object.guiScreenFrame)
      }
      if (object.guiSendInputEventRequest != null) {
        if (typeof object.guiSendInputEventRequest !== 'object') { throw TypeError('.PB.Main.guiSendInputEventRequest: object expected') }
        message.guiSendInputEventRequest = $root.PB_Gui.SendInputEventRequest.fromObject(object.guiSendInputEventRequest)
      }
      if (object.guiStartVirtualDisplayRequest != null) {
        if (typeof object.guiStartVirtualDisplayRequest !== 'object') { throw TypeError('.PB.Main.guiStartVirtualDisplayRequest: object expected') }
        message.guiStartVirtualDisplayRequest = $root.PB_Gui.StartVirtualDisplayRequest.fromObject(object.guiStartVirtualDisplayRequest)
      }
      if (object.guiStopVirtualDisplayRequest != null) {
        if (typeof object.guiStopVirtualDisplayRequest !== 'object') { throw TypeError('.PB.Main.guiStopVirtualDisplayRequest: object expected') }
        message.guiStopVirtualDisplayRequest = $root.PB_Gui.StopVirtualDisplayRequest.fromObject(object.guiStopVirtualDisplayRequest)
      }
      return message
    }

    Main.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) {
        object.commandId = 0
        object.commandStatus = options.enums === String ? 'OK' : 0
        object.hasNext = false
      }
      if (message.commandId != null && message.hasOwnProperty('commandId')) { object.commandId = message.commandId }
      if (message.commandStatus != null && message.hasOwnProperty('commandStatus')) { object.commandStatus = options.enums === String ? $root.PB.CommandStatus[message.commandStatus] : message.commandStatus }
      if (message.hasNext != null && message.hasOwnProperty('hasNext')) { object.hasNext = message.hasNext }
      if (message.empty != null && message.hasOwnProperty('empty')) {
        object.empty = $root.PB.Empty.toObject(message.empty, options)
        if (options.oneofs) { object.content = 'empty' }
      }
      if (message.pingRequest != null && message.hasOwnProperty('pingRequest')) {
        object.pingRequest = $root.PB_Status.PingRequest.toObject(message.pingRequest, options)
        if (options.oneofs) { object.content = 'pingRequest' }
      }
      if (message.pingResponse != null && message.hasOwnProperty('pingResponse')) {
        object.pingResponse = $root.PB_Status.PingResponse.toObject(message.pingResponse, options)
        if (options.oneofs) { object.content = 'pingResponse' }
      }
      if (message.storageListRequest != null && message.hasOwnProperty('storageListRequest')) {
        object.storageListRequest = $root.PB_Storage.ListRequest.toObject(message.storageListRequest, options)
        if (options.oneofs) { object.content = 'storageListRequest' }
      }
      if (message.storageListResponse != null && message.hasOwnProperty('storageListResponse')) {
        object.storageListResponse = $root.PB_Storage.ListResponse.toObject(message.storageListResponse, options)
        if (options.oneofs) { object.content = 'storageListResponse' }
      }
      if (message.storageReadRequest != null && message.hasOwnProperty('storageReadRequest')) {
        object.storageReadRequest = $root.PB_Storage.ReadRequest.toObject(message.storageReadRequest, options)
        if (options.oneofs) { object.content = 'storageReadRequest' }
      }
      if (message.storageReadResponse != null && message.hasOwnProperty('storageReadResponse')) {
        object.storageReadResponse = $root.PB_Storage.ReadResponse.toObject(message.storageReadResponse, options)
        if (options.oneofs) { object.content = 'storageReadResponse' }
      }
      if (message.storageWriteRequest != null && message.hasOwnProperty('storageWriteRequest')) {
        object.storageWriteRequest = $root.PB_Storage.WriteRequest.toObject(message.storageWriteRequest, options)
        if (options.oneofs) { object.content = 'storageWriteRequest' }
      }
      if (message.storageDeleteRequest != null && message.hasOwnProperty('storageDeleteRequest')) {
        object.storageDeleteRequest = $root.PB_Storage.DeleteRequest.toObject(message.storageDeleteRequest, options)
        if (options.oneofs) { object.content = 'storageDeleteRequest' }
      }
      if (message.storageMkdirRequest != null && message.hasOwnProperty('storageMkdirRequest')) {
        object.storageMkdirRequest = $root.PB_Storage.MkdirRequest.toObject(message.storageMkdirRequest, options)
        if (options.oneofs) { object.content = 'storageMkdirRequest' }
      }
      if (message.storageMd5sumRequest != null && message.hasOwnProperty('storageMd5sumRequest')) {
        object.storageMd5sumRequest = $root.PB_Storage.Md5sumRequest.toObject(message.storageMd5sumRequest, options)
        if (options.oneofs) { object.content = 'storageMd5sumRequest' }
      }
      if (message.storageMd5sumResponse != null && message.hasOwnProperty('storageMd5sumResponse')) {
        object.storageMd5sumResponse = $root.PB_Storage.Md5sumResponse.toObject(message.storageMd5sumResponse, options)
        if (options.oneofs) { object.content = 'storageMd5sumResponse' }
      }
      if (message.appStartRequest != null && message.hasOwnProperty('appStartRequest')) {
        object.appStartRequest = $root.PB_App.StartRequest.toObject(message.appStartRequest, options)
        if (options.oneofs) { object.content = 'appStartRequest' }
      }
      if (message.appLockStatusRequest != null && message.hasOwnProperty('appLockStatusRequest')) {
        object.appLockStatusRequest = $root.PB_App.LockStatusRequest.toObject(message.appLockStatusRequest, options)
        if (options.oneofs) { object.content = 'appLockStatusRequest' }
      }
      if (message.appLockStatusResponse != null && message.hasOwnProperty('appLockStatusResponse')) {
        object.appLockStatusResponse = $root.PB_App.LockStatusResponse.toObject(message.appLockStatusResponse, options)
        if (options.oneofs) { object.content = 'appLockStatusResponse' }
      }
      if (message.stopSession != null && message.hasOwnProperty('stopSession')) {
        object.stopSession = $root.PB.StopSession.toObject(message.stopSession, options)
        if (options.oneofs) { object.content = 'stopSession' }
      }
      if (message.guiStartScreenStreamRequest != null && message.hasOwnProperty('guiStartScreenStreamRequest')) {
        object.guiStartScreenStreamRequest = $root.PB_Gui.StartScreenStreamRequest.toObject(message.guiStartScreenStreamRequest, options)
        if (options.oneofs) { object.content = 'guiStartScreenStreamRequest' }
      }
      if (message.guiStopScreenStreamRequest != null && message.hasOwnProperty('guiStopScreenStreamRequest')) {
        object.guiStopScreenStreamRequest = $root.PB_Gui.StopScreenStreamRequest.toObject(message.guiStopScreenStreamRequest, options)
        if (options.oneofs) { object.content = 'guiStopScreenStreamRequest' }
      }
      if (message.guiScreenFrame != null && message.hasOwnProperty('guiScreenFrame')) {
        object.guiScreenFrame = $root.PB_Gui.ScreenFrame.toObject(message.guiScreenFrame, options)
        if (options.oneofs) { object.content = 'guiScreenFrame' }
      }
      if (message.guiSendInputEventRequest != null && message.hasOwnProperty('guiSendInputEventRequest')) {
        object.guiSendInputEventRequest = $root.PB_Gui.SendInputEventRequest.toObject(message.guiSendInputEventRequest, options)
        if (options.oneofs) { object.content = 'guiSendInputEventRequest' }
      }
      if (message.storageStatRequest != null && message.hasOwnProperty('storageStatRequest')) {
        object.storageStatRequest = $root.PB_Storage.StatRequest.toObject(message.storageStatRequest, options)
        if (options.oneofs) { object.content = 'storageStatRequest' }
      }
      if (message.storageStatResponse != null && message.hasOwnProperty('storageStatResponse')) {
        object.storageStatResponse = $root.PB_Storage.StatResponse.toObject(message.storageStatResponse, options)
        if (options.oneofs) { object.content = 'storageStatResponse' }
      }
      if (message.guiStartVirtualDisplayRequest != null && message.hasOwnProperty('guiStartVirtualDisplayRequest')) {
        object.guiStartVirtualDisplayRequest = $root.PB_Gui.StartVirtualDisplayRequest.toObject(message.guiStartVirtualDisplayRequest, options)
        if (options.oneofs) { object.content = 'guiStartVirtualDisplayRequest' }
      }
      if (message.guiStopVirtualDisplayRequest != null && message.hasOwnProperty('guiStopVirtualDisplayRequest')) {
        object.guiStopVirtualDisplayRequest = $root.PB_Gui.StopVirtualDisplayRequest.toObject(message.guiStopVirtualDisplayRequest, options)
        if (options.oneofs) { object.content = 'guiStopVirtualDisplayRequest' }
      }
      return object
    }

    Main.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return Main
  })()

  return PB
})()

export const PB_Storage = $root.PB_Storage = (() => {
  const PB_Storage = {}

  PB_Storage.File = (function () {
    function File (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    File.prototype.type = 0
    File.prototype.name = ''
    File.prototype.size = 0
    File.prototype.data = $util.newBuffer([])

    File.create = function create (properties) {
      return new File(properties)
    }

    File.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.type != null && Object.hasOwnProperty.call(message, 'type')) { writer.uint32(8).int32(message.type) }
      if (message.name != null && Object.hasOwnProperty.call(message, 'name')) { writer.uint32(18).string(message.name) }
      if (message.size != null && Object.hasOwnProperty.call(message, 'size')) { writer.uint32(24).uint32(message.size) }
      if (message.data != null && Object.hasOwnProperty.call(message, 'data')) { writer.uint32(34).bytes(message.data) }
      return writer
    }

    File.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    File.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.File()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.type = reader.int32()
            break
          case 2:
            message.name = reader.string()
            break
          case 3:
            message.size = reader.uint32()
            break
          case 4:
            message.data = reader.bytes()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    File.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    File.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.type != null && message.hasOwnProperty('type')) {
        switch (message.type) {
          default:
            return 'type: enum value expected'
          case 0:
          case 1:
            break
        }
      }
      if (message.name != null && message.hasOwnProperty('name')) {
        if (!$util.isString(message.name)) { return 'name: string expected' }
      }
      if (message.size != null && message.hasOwnProperty('size')) {
        if (!$util.isInteger(message.size)) { return 'size: integer expected' }
      }
      if (message.data != null && message.hasOwnProperty('data')) {
        if (!(message.data && typeof message.data.length === 'number' || $util.isString(message.data))) { return 'data: buffer expected' }
      }
      return null
    }

    File.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.File) { return object }
      const message = new $root.PB_Storage.File()
      switch (object.type) {
        case 'FILE':
        case 0:
          message.type = 0
          break
        case 'DIR':
        case 1:
          message.type = 1
          break
      }
      if (object.name != null) { message.name = String(object.name) }
      if (object.size != null) { message.size = object.size >>> 0 }
      if (object.data != null) {
        if (typeof object.data === 'string') { $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0) } else if (object.data.length) { message.data = object.data }
      }
      return message
    }

    File.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) {
        object.type = options.enums === String ? 'FILE' : 0
        object.name = ''
        object.size = 0
        if (options.bytes === String) { object.data = '' } else {
          object.data = []
          if (options.bytes !== Array) { object.data = $util.newBuffer(object.data) }
        }
      }
      if (message.type != null && message.hasOwnProperty('type')) { object.type = options.enums === String ? $root.PB_Storage.File.FileType[message.type] : message.type }
      if (message.name != null && message.hasOwnProperty('name')) { object.name = message.name }
      if (message.size != null && message.hasOwnProperty('size')) { object.size = message.size }
      if (message.data != null && message.hasOwnProperty('data')) { object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data }
      return object
    }

    File.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    File.FileType = (function () {
      const valuesById = {}, values = Object.create(valuesById)
      values[valuesById[0] = 'FILE'] = 0
      values[valuesById[1] = 'DIR'] = 1
      return values
    })()

    return File
  })()

  PB_Storage.StatRequest = (function () {
    function StatRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    StatRequest.prototype.path = ''

    StatRequest.create = function create (properties) {
      return new StatRequest(properties)
    }

    StatRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.path != null && Object.hasOwnProperty.call(message, 'path')) { writer.uint32(10).string(message.path) }
      return writer
    }

    StatRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    StatRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.StatRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.path = reader.string()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    StatRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    StatRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.path != null && message.hasOwnProperty('path')) {
        if (!$util.isString(message.path)) { return 'path: string expected' }
      }
      return null
    }

    StatRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.StatRequest) { return object }
      const message = new $root.PB_Storage.StatRequest()
      if (object.path != null) { message.path = String(object.path) }
      return message
    }

    StatRequest.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) { object.path = '' }
      if (message.path != null && message.hasOwnProperty('path')) { object.path = message.path }
      return object
    }

    StatRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return StatRequest
  })()

  PB_Storage.StatResponse = (function () {
    function StatResponse (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    StatResponse.prototype.file = null

    StatResponse.create = function create (properties) {
      return new StatResponse(properties)
    }

    StatResponse.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.file != null && Object.hasOwnProperty.call(message, 'file')) { $root.PB_Storage.File.encode(message.file, writer.uint32(10).fork()).ldelim() }
      return writer
    }

    StatResponse.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    StatResponse.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.StatResponse()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.file = $root.PB_Storage.File.decode(reader, reader.uint32())
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    StatResponse.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    StatResponse.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.file != null && message.hasOwnProperty('file')) {
        const error = $root.PB_Storage.File.verify(message.file)
        if (error) { return 'file.' + error }
      }
      return null
    }

    StatResponse.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.StatResponse) { return object }
      const message = new $root.PB_Storage.StatResponse()
      if (object.file != null) {
        if (typeof object.file !== 'object') { throw TypeError('.PB_Storage.StatResponse.file: object expected') }
        message.file = $root.PB_Storage.File.fromObject(object.file)
      }
      return message
    }

    StatResponse.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) { object.file = null }
      if (message.file != null && message.hasOwnProperty('file')) { object.file = $root.PB_Storage.File.toObject(message.file, options) }
      return object
    }

    StatResponse.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return StatResponse
  })()

  PB_Storage.ListRequest = (function () {
    function ListRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    ListRequest.prototype.path = ''

    ListRequest.create = function create (properties) {
      return new ListRequest(properties)
    }

    ListRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.path != null && Object.hasOwnProperty.call(message, 'path')) { writer.uint32(10).string(message.path) }
      return writer
    }

    ListRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    ListRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.ListRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.path = reader.string()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    ListRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    ListRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.path != null && message.hasOwnProperty('path')) {
        if (!$util.isString(message.path)) { return 'path: string expected' }
      }
      return null
    }

    ListRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.ListRequest) { return object }
      const message = new $root.PB_Storage.ListRequest()
      if (object.path != null) { message.path = String(object.path) }
      return message
    }

    ListRequest.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) { object.path = '' }
      if (message.path != null && message.hasOwnProperty('path')) { object.path = message.path }
      return object
    }

    ListRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return ListRequest
  })()

  PB_Storage.ListResponse = (function () {
    function ListResponse (properties) {
      this.file = []
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    ListResponse.prototype.file = $util.emptyArray

    ListResponse.create = function create (properties) {
      return new ListResponse(properties)
    }

    ListResponse.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.file != null && message.file.length) {
        for (let i = 0; i < message.file.length; ++i) { $root.PB_Storage.File.encode(message.file[i], writer.uint32(10).fork()).ldelim() }
      }
      return writer
    }

    ListResponse.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    ListResponse.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.ListResponse()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            if (!(message.file && message.file.length)) { message.file = [] }
            message.file.push($root.PB_Storage.File.decode(reader, reader.uint32()))
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    ListResponse.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    ListResponse.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.file != null && message.hasOwnProperty('file')) {
        if (!Array.isArray(message.file)) { return 'file: array expected' }
        for (let i = 0; i < message.file.length; ++i) {
          const error = $root.PB_Storage.File.verify(message.file[i])
          if (error) { return 'file.' + error }
        }
      }
      return null
    }

    ListResponse.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.ListResponse) { return object }
      const message = new $root.PB_Storage.ListResponse()
      if (object.file) {
        if (!Array.isArray(object.file)) { throw TypeError('.PB_Storage.ListResponse.file: array expected') }
        message.file = []
        for (let i = 0; i < object.file.length; ++i) {
          if (typeof object.file[i] !== 'object') { throw TypeError('.PB_Storage.ListResponse.file: object expected') }
          message.file[i] = $root.PB_Storage.File.fromObject(object.file[i])
        }
      }
      return message
    }

    ListResponse.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.arrays || options.defaults) { object.file = [] }
      if (message.file && message.file.length) {
        object.file = []
        for (let j = 0; j < message.file.length; ++j) { object.file[j] = $root.PB_Storage.File.toObject(message.file[j], options) }
      }
      return object
    }

    ListResponse.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return ListResponse
  })()

  PB_Storage.ReadRequest = (function () {
    function ReadRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    ReadRequest.prototype.path = ''

    ReadRequest.create = function create (properties) {
      return new ReadRequest(properties)
    }

    ReadRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.path != null && Object.hasOwnProperty.call(message, 'path')) { writer.uint32(10).string(message.path) }
      return writer
    }

    ReadRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    ReadRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.ReadRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.path = reader.string()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    ReadRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    ReadRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.path != null && message.hasOwnProperty('path')) {
        if (!$util.isString(message.path)) { return 'path: string expected' }
      }
      return null
    }

    ReadRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.ReadRequest) { return object }
      const message = new $root.PB_Storage.ReadRequest()
      if (object.path != null) { message.path = String(object.path) }
      return message
    }

    ReadRequest.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) { object.path = '' }
      if (message.path != null && message.hasOwnProperty('path')) { object.path = message.path }
      return object
    }

    ReadRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return ReadRequest
  })()

  PB_Storage.ReadResponse = (function () {
    function ReadResponse (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    ReadResponse.prototype.file = null

    ReadResponse.create = function create (properties) {
      return new ReadResponse(properties)
    }

    ReadResponse.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.file != null && Object.hasOwnProperty.call(message, 'file')) { $root.PB_Storage.File.encode(message.file, writer.uint32(10).fork()).ldelim() }
      return writer
    }

    ReadResponse.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    ReadResponse.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.ReadResponse()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.file = $root.PB_Storage.File.decode(reader, reader.uint32())
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    ReadResponse.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    ReadResponse.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.file != null && message.hasOwnProperty('file')) {
        const error = $root.PB_Storage.File.verify(message.file)
        if (error) { return 'file.' + error }
      }
      return null
    }

    ReadResponse.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.ReadResponse) { return object }
      const message = new $root.PB_Storage.ReadResponse()
      if (object.file != null) {
        if (typeof object.file !== 'object') { throw TypeError('.PB_Storage.ReadResponse.file: object expected') }
        message.file = $root.PB_Storage.File.fromObject(object.file)
      }
      return message
    }

    ReadResponse.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) { object.file = null }
      if (message.file != null && message.hasOwnProperty('file')) { object.file = $root.PB_Storage.File.toObject(message.file, options) }
      return object
    }

    ReadResponse.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return ReadResponse
  })()

  PB_Storage.WriteRequest = (function () {
    function WriteRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    WriteRequest.prototype.path = ''
    WriteRequest.prototype.file = null

    WriteRequest.create = function create (properties) {
      return new WriteRequest(properties)
    }

    WriteRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.path != null && Object.hasOwnProperty.call(message, 'path')) { writer.uint32(10).string(message.path) }
      if (message.file != null && Object.hasOwnProperty.call(message, 'file')) { $root.PB_Storage.File.encode(message.file, writer.uint32(18).fork()).ldelim() }
      return writer
    }

    WriteRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    WriteRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.WriteRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.path = reader.string()
            break
          case 2:
            message.file = $root.PB_Storage.File.decode(reader, reader.uint32())
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    WriteRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    WriteRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.path != null && message.hasOwnProperty('path')) {
        if (!$util.isString(message.path)) { return 'path: string expected' }
      }
      if (message.file != null && message.hasOwnProperty('file')) {
        const error = $root.PB_Storage.File.verify(message.file)
        if (error) { return 'file.' + error }
      }
      return null
    }

    WriteRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.WriteRequest) { return object }
      const message = new $root.PB_Storage.WriteRequest()
      if (object.path != null) { message.path = String(object.path) }
      if (object.file != null) {
        if (typeof object.file !== 'object') { throw TypeError('.PB_Storage.WriteRequest.file: object expected') }
        message.file = $root.PB_Storage.File.fromObject(object.file)
      }
      return message
    }

    WriteRequest.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) {
        object.path = ''
        object.file = null
      }
      if (message.path != null && message.hasOwnProperty('path')) { object.path = message.path }
      if (message.file != null && message.hasOwnProperty('file')) { object.file = $root.PB_Storage.File.toObject(message.file, options) }
      return object
    }

    WriteRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return WriteRequest
  })()

  PB_Storage.DeleteRequest = (function () {
    function DeleteRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    DeleteRequest.prototype.path = ''
    DeleteRequest.prototype.recursive = false

    DeleteRequest.create = function create (properties) {
      return new DeleteRequest(properties)
    }

    DeleteRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.path != null && Object.hasOwnProperty.call(message, 'path')) { writer.uint32(10).string(message.path) }
      if (message.recursive != null && Object.hasOwnProperty.call(message, 'recursive')) { writer.uint32(16).bool(message.recursive) }
      return writer
    }

    DeleteRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    DeleteRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.DeleteRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.path = reader.string()
            break
          case 2:
            message.recursive = reader.bool()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    DeleteRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    DeleteRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.path != null && message.hasOwnProperty('path')) {
        if (!$util.isString(message.path)) { return 'path: string expected' }
      }
      if (message.recursive != null && message.hasOwnProperty('recursive')) {
        if (typeof message.recursive !== 'boolean') { return 'recursive: boolean expected' }
      }
      return null
    }

    DeleteRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.DeleteRequest) { return object }
      const message = new $root.PB_Storage.DeleteRequest()
      if (object.path != null) { message.path = String(object.path) }
      if (object.recursive != null) { message.recursive = Boolean(object.recursive) }
      return message
    }

    DeleteRequest.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) {
        object.path = ''
        object.recursive = false
      }
      if (message.path != null && message.hasOwnProperty('path')) { object.path = message.path }
      if (message.recursive != null && message.hasOwnProperty('recursive')) { object.recursive = message.recursive }
      return object
    }

    DeleteRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return DeleteRequest
  })()

  PB_Storage.MkdirRequest = (function () {
    function MkdirRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    MkdirRequest.prototype.path = ''

    MkdirRequest.create = function create (properties) {
      return new MkdirRequest(properties)
    }

    MkdirRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.path != null && Object.hasOwnProperty.call(message, 'path')) { writer.uint32(10).string(message.path) }
      return writer
    }

    MkdirRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    MkdirRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.MkdirRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.path = reader.string()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    MkdirRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    MkdirRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.path != null && message.hasOwnProperty('path')) {
        if (!$util.isString(message.path)) { return 'path: string expected' }
      }
      return null
    }

    MkdirRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.MkdirRequest) { return object }
      const message = new $root.PB_Storage.MkdirRequest()
      if (object.path != null) { message.path = String(object.path) }
      return message
    }

    MkdirRequest.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) { object.path = '' }
      if (message.path != null && message.hasOwnProperty('path')) { object.path = message.path }
      return object
    }

    MkdirRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return MkdirRequest
  })()

  PB_Storage.Md5sumRequest = (function () {
    function Md5sumRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    Md5sumRequest.prototype.path = ''

    Md5sumRequest.create = function create (properties) {
      return new Md5sumRequest(properties)
    }

    Md5sumRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.path != null && Object.hasOwnProperty.call(message, 'path')) { writer.uint32(10).string(message.path) }
      return writer
    }

    Md5sumRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    Md5sumRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.Md5sumRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.path = reader.string()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    Md5sumRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    Md5sumRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.path != null && message.hasOwnProperty('path')) {
        if (!$util.isString(message.path)) { return 'path: string expected' }
      }
      return null
    }

    Md5sumRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.Md5sumRequest) { return object }
      const message = new $root.PB_Storage.Md5sumRequest()
      if (object.path != null) { message.path = String(object.path) }
      return message
    }

    Md5sumRequest.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) { object.path = '' }
      if (message.path != null && message.hasOwnProperty('path')) { object.path = message.path }
      return object
    }

    Md5sumRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return Md5sumRequest
  })()

  PB_Storage.Md5sumResponse = (function () {
    function Md5sumResponse (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    Md5sumResponse.prototype.md5sum = ''

    Md5sumResponse.create = function create (properties) {
      return new Md5sumResponse(properties)
    }

    Md5sumResponse.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.md5sum != null && Object.hasOwnProperty.call(message, 'md5sum')) { writer.uint32(10).string(message.md5sum) }
      return writer
    }

    Md5sumResponse.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    Md5sumResponse.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Storage.Md5sumResponse()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.md5sum = reader.string()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    Md5sumResponse.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    Md5sumResponse.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.md5sum != null && message.hasOwnProperty('md5sum')) {
        if (!$util.isString(message.md5sum)) { return 'md5sum: string expected' }
      }
      return null
    }

    Md5sumResponse.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Storage.Md5sumResponse) { return object }
      const message = new $root.PB_Storage.Md5sumResponse()
      if (object.md5sum != null) { message.md5sum = String(object.md5sum) }
      return message
    }

    Md5sumResponse.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) { object.md5sum = '' }
      if (message.md5sum != null && message.hasOwnProperty('md5sum')) { object.md5sum = message.md5sum }
      return object
    }

    Md5sumResponse.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return Md5sumResponse
  })()

  return PB_Storage
})()

export const PB_Status = $root.PB_Status = (() => {
  const PB_Status = {}

  PB_Status.PingRequest = (function () {
    function PingRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    PingRequest.prototype.data = $util.newBuffer([])

    PingRequest.create = function create (properties) {
      return new PingRequest(properties)
    }

    PingRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.data != null && Object.hasOwnProperty.call(message, 'data')) { writer.uint32(10).bytes(message.data) }
      return writer
    }

    PingRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    PingRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Status.PingRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.data = reader.bytes()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    PingRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    PingRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.data != null && message.hasOwnProperty('data')) {
        if (!(message.data && typeof message.data.length === 'number' || $util.isString(message.data))) { return 'data: buffer expected' }
      }
      return null
    }

    PingRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Status.PingRequest) { return object }
      const message = new $root.PB_Status.PingRequest()
      if (object.data != null) {
        if (typeof object.data === 'string') { $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0) } else if (object.data.length) { message.data = object.data }
      }
      return message
    }

    PingRequest.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) {
        if (options.bytes === String) { object.data = '' } else {
          object.data = []
          if (options.bytes !== Array) { object.data = $util.newBuffer(object.data) }
        }
      }
      if (message.data != null && message.hasOwnProperty('data')) { object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data }
      return object
    }

    PingRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return PingRequest
  })()

  PB_Status.PingResponse = (function () {
    function PingResponse (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    PingResponse.prototype.data = $util.newBuffer([])

    PingResponse.create = function create (properties) {
      return new PingResponse(properties)
    }

    PingResponse.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.data != null && Object.hasOwnProperty.call(message, 'data')) { writer.uint32(10).bytes(message.data) }
      return writer
    }

    PingResponse.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    PingResponse.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Status.PingResponse()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.data = reader.bytes()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    PingResponse.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    PingResponse.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.data != null && message.hasOwnProperty('data')) {
        if (!(message.data && typeof message.data.length === 'number' || $util.isString(message.data))) { return 'data: buffer expected' }
      }
      return null
    }

    PingResponse.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Status.PingResponse) { return object }
      const message = new $root.PB_Status.PingResponse()
      if (object.data != null) {
        if (typeof object.data === 'string') { $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0) } else if (object.data.length) { message.data = object.data }
      }
      return message
    }

    PingResponse.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) {
        if (options.bytes === String) { object.data = '' } else {
          object.data = []
          if (options.bytes !== Array) { object.data = $util.newBuffer(object.data) }
        }
      }
      if (message.data != null && message.hasOwnProperty('data')) { object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data }
      return object
    }

    PingResponse.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return PingResponse
  })()

  return PB_Status
})()

export const PB_Gui = $root.PB_Gui = (() => {
  const PB_Gui = {}

  PB_Gui.InputKey = (function () {
    const valuesById = {}, values = Object.create(valuesById)
    values[valuesById[0] = 'UP'] = 0
    values[valuesById[1] = 'DOWN'] = 1
    values[valuesById[2] = 'RIGHT'] = 2
    values[valuesById[3] = 'LEFT'] = 3
    values[valuesById[4] = 'OK'] = 4
    values[valuesById[5] = 'BACK'] = 5
    return values
  })()

  PB_Gui.InputType = (function () {
    const valuesById = {}, values = Object.create(valuesById)
    values[valuesById[0] = 'PRESS'] = 0
    values[valuesById[1] = 'RELEASE'] = 1
    values[valuesById[2] = 'SHORT'] = 2
    values[valuesById[3] = 'LONG'] = 3
    values[valuesById[4] = 'REPEAT'] = 4
    return values
  })()

  PB_Gui.ScreenFrame = (function () {
    function ScreenFrame (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    ScreenFrame.prototype.data = $util.newBuffer([])

    ScreenFrame.create = function create (properties) {
      return new ScreenFrame(properties)
    }

    ScreenFrame.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.data != null && Object.hasOwnProperty.call(message, 'data')) { writer.uint32(10).bytes(message.data) }
      return writer
    }

    ScreenFrame.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    ScreenFrame.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Gui.ScreenFrame()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.data = reader.bytes()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    ScreenFrame.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    ScreenFrame.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.data != null && message.hasOwnProperty('data')) {
        if (!(message.data && typeof message.data.length === 'number' || $util.isString(message.data))) { return 'data: buffer expected' }
      }
      return null
    }

    ScreenFrame.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Gui.ScreenFrame) { return object }
      const message = new $root.PB_Gui.ScreenFrame()
      if (object.data != null) {
        if (typeof object.data === 'string') { $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0) } else if (object.data.length) { message.data = object.data }
      }
      return message
    }

    ScreenFrame.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) {
        if (options.bytes === String) { object.data = '' } else {
          object.data = []
          if (options.bytes !== Array) { object.data = $util.newBuffer(object.data) }
        }
      }
      if (message.data != null && message.hasOwnProperty('data')) { object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data }
      return object
    }

    ScreenFrame.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return ScreenFrame
  })()

  PB_Gui.StartScreenStreamRequest = (function () {
    function StartScreenStreamRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    StartScreenStreamRequest.create = function create (properties) {
      return new StartScreenStreamRequest(properties)
    }

    StartScreenStreamRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      return writer
    }

    StartScreenStreamRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    StartScreenStreamRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Gui.StartScreenStreamRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    StartScreenStreamRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    StartScreenStreamRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      return null
    }

    StartScreenStreamRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Gui.StartScreenStreamRequest) { return object }
      return new $root.PB_Gui.StartScreenStreamRequest()
    }

    StartScreenStreamRequest.toObject = function toObject () {
      return {}
    }

    StartScreenStreamRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return StartScreenStreamRequest
  })()

  PB_Gui.StopScreenStreamRequest = (function () {
    function StopScreenStreamRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    StopScreenStreamRequest.create = function create (properties) {
      return new StopScreenStreamRequest(properties)
    }

    StopScreenStreamRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      return writer
    }

    StopScreenStreamRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    StopScreenStreamRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Gui.StopScreenStreamRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    StopScreenStreamRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    StopScreenStreamRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      return null
    }

    StopScreenStreamRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Gui.StopScreenStreamRequest) { return object }
      return new $root.PB_Gui.StopScreenStreamRequest()
    }

    StopScreenStreamRequest.toObject = function toObject () {
      return {}
    }

    StopScreenStreamRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return StopScreenStreamRequest
  })()

  PB_Gui.SendInputEventRequest = (function () {
    function SendInputEventRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    SendInputEventRequest.prototype.key = 0
    SendInputEventRequest.prototype.type = 0

    SendInputEventRequest.create = function create (properties) {
      return new SendInputEventRequest(properties)
    }

    SendInputEventRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      if (message.key != null && Object.hasOwnProperty.call(message, 'key')) { writer.uint32(8).int32(message.key) }
      if (message.type != null && Object.hasOwnProperty.call(message, 'type')) { writer.uint32(16).int32(message.type) }
      return writer
    }

    SendInputEventRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    SendInputEventRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Gui.SendInputEventRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          case 1:
            message.key = reader.int32()
            break
          case 2:
            message.type = reader.int32()
            break
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    SendInputEventRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    SendInputEventRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      if (message.key != null && message.hasOwnProperty('key')) {
        switch (message.key) {
          default:
            return 'key: enum value expected'
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break
        }
      }
      if (message.type != null && message.hasOwnProperty('type')) {
        switch (message.type) {
          default:
            return 'type: enum value expected'
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
            break
        }
      }
      return null
    }

    SendInputEventRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Gui.SendInputEventRequest) { return object }
      const message = new $root.PB_Gui.SendInputEventRequest()
      switch (object.key) {
        case 'UP':
        case 0:
          message.key = 0
          break
        case 'DOWN':
        case 1:
          message.key = 1
          break
        case 'RIGHT':
        case 2:
          message.key = 2
          break
        case 'LEFT':
        case 3:
          message.key = 3
          break
        case 'OK':
        case 4:
          message.key = 4
          break
        case 'BACK':
        case 5:
          message.key = 5
          break
      }
      switch (object.type) {
        case 'PRESS':
        case 0:
          message.type = 0
          break
        case 'RELEASE':
        case 1:
          message.type = 1
          break
        case 'SHORT':
        case 2:
          message.type = 2
          break
        case 'LONG':
        case 3:
          message.type = 3
          break
        case 'REPEAT':
        case 4:
          message.type = 4
          break
      }
      return message
    }

    SendInputEventRequest.toObject = function toObject (message, options) {
      if (!options) { options = {} }
      const object = {}
      if (options.defaults) {
        object.key = options.enums === String ? 'UP' : 0
        object.type = options.enums === String ? 'PRESS' : 0
      }
      if (message.key != null && message.hasOwnProperty('key')) { object.key = options.enums === String ? $root.PB_Gui.InputKey[message.key] : message.key }
      if (message.type != null && message.hasOwnProperty('type')) { object.type = options.enums === String ? $root.PB_Gui.InputType[message.type] : message.type }
      return object
    }

    SendInputEventRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return SendInputEventRequest
  })()

  PB_Gui.StartVirtualDisplayRequest = (function () {
    function StartVirtualDisplayRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    StartVirtualDisplayRequest.create = function create (properties) {
      return new StartVirtualDisplayRequest(properties)
    }

    StartVirtualDisplayRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      return writer
    }

    StartVirtualDisplayRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    StartVirtualDisplayRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Gui.StartVirtualDisplayRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    StartVirtualDisplayRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    StartVirtualDisplayRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      return null
    }

    StartVirtualDisplayRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Gui.StartVirtualDisplayRequest) { return object }
      return new $root.PB_Gui.StartVirtualDisplayRequest()
    }

    StartVirtualDisplayRequest.toObject = function toObject () {
      return {}
    }

    StartVirtualDisplayRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return StartVirtualDisplayRequest
  })()

  PB_Gui.StopVirtualDisplayRequest = (function () {
    function StopVirtualDisplayRequest (properties) {
      if (properties) {
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) {
          if (properties[keys[i]] != null) { this[keys[i]] = properties[keys[i]] }
        }
      }
    }

    StopVirtualDisplayRequest.create = function create (properties) {
      return new StopVirtualDisplayRequest(properties)
    }

    StopVirtualDisplayRequest.encode = function encode (message, writer) {
      if (!writer) { writer = $Writer.create() }
      return writer
    }

    StopVirtualDisplayRequest.encodeDelimited = function encodeDelimited (message, writer) {
      return this.encode(message, writer).ldelim()
    }

    StopVirtualDisplayRequest.decode = function decode (reader, length) {
      if (!(reader instanceof $Reader)) { reader = $Reader.create(reader) }
      const end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB_Gui.StopVirtualDisplayRequest()
      while (reader.pos < end) {
        const tag = reader.uint32()
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7)
            break
        }
      }
      return message
    }

    StopVirtualDisplayRequest.decodeDelimited = function decodeDelimited (reader) {
      if (!(reader instanceof $Reader)) { reader = new $Reader(reader) }
      return this.decode(reader, reader.uint32())
    }

    StopVirtualDisplayRequest.verify = function verify (message) {
      if (typeof message !== 'object' || message === null) { return 'object expected' }
      return null
    }

    StopVirtualDisplayRequest.fromObject = function fromObject (object) {
      if (object instanceof $root.PB_Gui.StopVirtualDisplayRequest) { return object }
      return new $root.PB_Gui.StopVirtualDisplayRequest()
    }

    StopVirtualDisplayRequest.toObject = function toObject () {
      return {}
    }

    StopVirtualDisplayRequest.prototype.toJSON = function toJSON () {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions)
    }

    return StopVirtualDisplayRequest
  })()

  return PB_Gui
})()

export { $root as default }
