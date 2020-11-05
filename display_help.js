function displayHelp() {

    try {
        isHelpHidden = !isHelpHidden;
    } catch {
        isHelpHidden = true;
    }

    let help = document.getElementById('hilfe');
    help.setAttribute('style', isHelpHidden ? 'display: block;' : 'display: none;')

}
