import '../index.css';

export function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-gray-200">
            <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
            <p className="text-lg mb-2">Sorry, the page you are looking for does not exist.</p>
            <p className="text-sm text-gray-400">Please check the URL or return to the homepage.</p>

            <a
                href="/"
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-400 transition duration-200"
            >
                Go to Home
            </a>
        </div>
    );
}
