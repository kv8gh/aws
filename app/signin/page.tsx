'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Signin: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.status === 200) {
        localStorage.setItem("token", data.token);
        router.push("/"); // Redirect to home after successful login
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto px-4 pt-8 text-center lg:px-12 lg:pt-16">
          <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-black md:text-5xl lg:text-6xl">
            Sign In to Your Account
          </h1>
          <p className="mb-6 text-gray-700 sm:px-16 md:text-lg lg:text-xl xl:px-48 font-thin">
            Welcome back! Please enter your credentials to continue.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-md md:text-xl font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 rounded-md group-hover:bg-opacity-0">
                🚀 Sign In 🚀
              </span>
            </button>
          </form>
          <div className="mt-4">
            <Link href="/signup" className="text-blue-500">
              Don’t have an account? Sign up here.
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
