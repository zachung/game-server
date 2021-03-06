export function copyToClipboard (elem) {
  // create hidden text element, if it doesn't already exist
  let targetId = '_hiddenCopyText_'
  let isInput = elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA'
  let origSelectionStart, origSelectionEnd
  let target
  if (isInput) {
    // can just use the original source element for the selection and copy
    target = elem
    origSelectionStart = elem.selectionStart
    origSelectionEnd = elem.selectionEnd
  } else {
    // must use a temporary form element for the selection and copy
    target = document.getElementById(targetId)
    if (!target) {
      target = document.createElement('textarea')
      target.style.position = 'absolute'
      target.style.left = '-9999px'
      target.style.top = '0'
      target.id = targetId
      document.body.appendChild(target)
    }
    target.textContent = elem.textContent
  }
  // select the content
  let currentFocus = document.activeElement
  target.focus()
  target.setSelectionRange(0, target.value.length)

  // copy the selection
  let succeed
  try {
    succeed = document.execCommand('copy')
  } catch (e) {
    succeed = false
  }
  // restore original focus
  if (currentFocus && typeof currentFocus.focus === 'function') {
    currentFocus.focus()
  }

  if (isInput) {
    // restore prior selection
    elem.setSelectionRange(origSelectionStart, origSelectionEnd)
  } else {
    // clear temporary content
    target.textContent = ''
  }
  return succeed
}

// returns a random number between min (included) and max (excluded)
export function getRndInteger (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}
