module.exports = Preferences

var hx = require('../lib/hx')
var {dispatch} = require('../lib/dispatcher')

var remote = require('electron').remote
var dialog = remote.dialog

function Preferences (state) {
  return hx`
    <div class='preferences'>
      ${renderGeneralSection(state)}
      ${renderPaymentSection(state)}
    </div>
  `
}

function renderGeneralSection (state) {
  return renderSection({
    title: 'General',
    description: '',
    icon: 'settings'
  }, [
    renderDownloadDirSelector(state)
  ])
}

function renderDownloadDirSelector (state) {
  return renderFileSelector({
      label: 'Download Path',
      description: 'Data from torrents will be saved here',
      property: 'downloadPath',
      options: {
        title: 'Select download directory',
        properties: [ 'openDirectory' ]
      }
    },
    state.unsaved.prefs.downloadPath,
    function (filePath) {
      setStateValue('downloadPath', filePath)
    })
}

function renderPaymentSection (state) {
  return renderSection({
    title: 'Payment',
    description: 'Setup your blablabla',
    // TODO real icon
    icon: 'settings'
  }, [
    renderILP(state)
  ])
}

function savePaymentAccount (event) {
  setStateValue('paymentAccount', event.target.value)
}

function savePaymentPassword (event) {
  setStateValue('paymentPassword', event.target.value)
}

function renderILP (state) {
  const paymentAccount = state.saved.prefs.paymentAccount
  const paymentPassword = state.saved.prefs.paymentPassword

  return hx`
    <div>
      <div class='control-group'>
        <div class='controls'>
          <label class='control-label'>
            <div class='preference-title'>Account</div>
            <div class='preference-description'>Description</div>
          </label>
          <div class='controls'>
            <input type='text' id=paymentAccount value=${paymentAccount} onkeyup=${savePaymentAccount} />
          </div>
        </div>
      </div>
      <div class='control-group'>
        <div class='controls'>
          <label class='control-label'>
            <div class='preference-title'>Password</div>
            <div class='preference-description'>Description</div>
          </label>
          <div class='controls'>
            <input type='text' id=paymentPassword value=${paymentPassword} onkeyup=${savePaymentPassword} />
          </div>
        </div>
      </div>
    </div>
  `
}

// Renders a prefs section.
// - definition should be {icon, title, description}
// - controls should be an array of vdom elements
function renderSection (definition, controls) {
  var helpElem = !definition.description ? null : hx`
    <div class='help text'>
      <i.icon>help_outline</i>${definition.description}
    </div>
  `
  return hx`
    <section class='section preferences-panel'>
      <div class='section-container'>
        <div class='section-heading'>
          <i.icon>${definition.icon}</i>${definition.title}
        </div>
        ${helpElem}
        <div class='section-body'>
          ${controls}
        </div>
      </div>
    </section>
  `
}

// Creates a file chooser
// - defition should be {label, description, options}
//   options are passed to dialog.showOpenDialog
// - value should be the current pref, a file or folder path
// - callback takes a new file or folder path
function renderFileSelector (definition, value, callback) {
  return hx`
    <div class='control-group'>
      <div class='controls'>
        <label class='control-label'>
          <div class='preference-title'>${definition.label}</div>
          <div class='preference-description'>${definition.description}</div>
        </label>
        <div class='controls'>
          <input type='text' class='file-picker-text'
            id=${definition.property}
            disabled='disabled'
            value=${value} />
          <button class='btn' onclick=${handleClick}>
            <i.icon>folder_open</i>
          </button>
        </div>
      </div>
    </div>
  `
  function handleClick () {
    dialog.showOpenDialog(remote.getCurrentWindow(), definition.options, function (filenames) {
      if (!Array.isArray(filenames)) return
      callback(filenames[0])
    })
  }
}

function setStateValue (property, value) {
  dispatch('updatePreferences', property, value)
}
