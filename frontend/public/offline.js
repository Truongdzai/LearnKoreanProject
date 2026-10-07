// Tách khỏi offline.html: CSP script-src của backend không cho handler inline (onclick=…)
document.getElementById('retry').addEventListener('click', () => location.reload())
