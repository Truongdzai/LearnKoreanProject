const CLOUDFLARE_ONLY = new Set([521, 522, 523, 524, 530])
const AMBIGUOUS = new Set([502, 503, 504])

export function isBackendDown(res: Response): boolean {
	if (CLOUDFLARE_ONLY.has(res.status)) return true
	if (!AMBIGUOUS.has(res.status)) return false
	return !(res.headers.get('content-type') || '').includes('json')
}

function wantsHtml(request: Request): boolean {
	if (request.method !== 'GET') return false
	return (request.headers.get('Accept') || '').includes('text/html')
}

const PAGE = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>VyLing đang khởi động…</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;
font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
color:#1e2340;background:#eef1ff;overflow:hidden}
.blob{position:fixed;border-radius:50%;filter:blur(70px);opacity:.55;
animation:drift 14s ease-in-out infinite}
.b1{width:380px;height:380px;background:#8b7cff;top:-120px;left:-100px}
.b2{width:320px;height:320px;background:#4fd1c5;bottom:-110px;right:-80px;animation-delay:-5s}
.b3{width:260px;height:260px;background:#ffb1d8;top:45%;right:20%;animation-delay:-9s}
@keyframes drift{0%,100%{transform:translate(0,0) scale(1)}
50%{transform:translate(24px,-30px) scale(1.09)}}
.card{position:relative;z-index:1;max-width:400px;width:100%;text-align:center;
padding:36px 28px;border-radius:22px;background:rgba(255,255,255,.72);
backdrop-filter:blur(14px);box-shadow:0 18px 50px rgba(40,40,110,.16)}
.ring{width:52px;height:52px;margin:0 auto 20px;border-radius:50%;
border:4px solid rgba(120,110,255,.22);border-top-color:#6c5ce7;
animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
h1{margin:0 0 10px;font-size:20px;font-weight:650}
p{margin:0 0 6px;font-size:14.5px;line-height:1.6;color:#4a4f70}
.en{color:#7b80a0;font-size:13px}
.bar{margin-top:22px;height:5px;border-radius:99px;background:rgba(120,110,255,.16);overflow:hidden}
.bar i{display:block;height:100%;width:40%;border-radius:99px;
background:linear-gradient(90deg,#6c5ce7,#4fd1c5);animation:slide 1.7s ease-in-out infinite}
@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(280%)}}
@media (prefers-color-scheme:dark){
body{color:#eef0ff;background:#12142a}
.card{background:rgba(28,30,58,.72);box-shadow:0 18px 50px rgba(0,0,0,.42)}
p{color:#b9bde0}.en{color:#868bb4}}
@media (prefers-reduced-motion:reduce){.blob,.ring,.bar i{animation:none}}
</style>
</head>
<body>
<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
<div class="card">
<div class="ring"></div>
<h1>VyLing đang khởi động</h1>
<p>Máy chủ vừa thức dậy, chờ khoảng nửa phút rồi trang sẽ tự mở.</p>
<p class="en">Waking the server up. This page reloads on its own.</p>
<div class="bar"><i></i></div>
</div>
<script>
var wait = 3000;
(function tick(){
  setTimeout(function(){
    fetch('/cf/ready', { cache: 'no-store' })
      .then(function(r){
        if (r.ok) { location.reload(); return }
        throw new Error('chua san sang')
      })
      .catch(function(){ wait = Math.min(wait * 1.5, 15000); tick() })
  }, wait)
})()
</script>
</body>
</html>`

export function waitingResponse(request: Request): Response {
	const headers = { 'Retry-After': '10', 'Cache-Control': 'no-store' }

	if (wantsHtml(request)) {
		return new Response(PAGE, {
			status: 503,
			headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
		})
	}

	return new Response(
		JSON.stringify({ detail: 'Máy chủ đang khởi động, thử lại sau giây lát.', starting: true }),
		{ status: 503, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' } },
	)
}
