


export default function NotFound() {
  return (
    <>
  <style
    dangerouslySetInnerHTML={{
      __html:
        "\n        @keyframes float {\n            0% { transform: translateY(0); }\n            50% { transform: translateY(-10px); }\n            100% { transform: translateY(0); }\n        }\n    "
    }}
  />
  <div className="text-center animate-fadeIn">
    <img
      src="https://cdn-icons-png.flaticon.com/512/755/755014.png"
      alt="404 Illustration"
      className="mx-auto w-80 animate-[float_3s_infinite] rounded-lg"
    />
    <h1 className="text-7xl font-extrabold text-[#FDB62F] mt-6">
      Looks Like You're Lost!
    </h1>
    <p className="text-xl text-gray-700 mt-2">
      We can't seem to find the page you're looking for.
    </p>
    <a
      href="/"
      className="mt-6 inline-block bg-[#FDB62F] text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transform transition hover:scale-105 hover:bg-blue-700"
    >
      Return Home
    </a>
  </div>
</>
  )
}
