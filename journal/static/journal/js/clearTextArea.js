const clearButton = document.getElementById('clear_bt');

clearButton.addEventListener('click', clearTextArea);


function clearTextArea() {
    const journalEntryTextArea = document.getElementById('journal-input');
    journalEntryTextArea.value = '';
}

