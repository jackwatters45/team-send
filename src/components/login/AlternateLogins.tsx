import Image from "next/image";

// TODO get working
// TODO href
const AlternateLogins = () => {
  return (
    <div className="flex flex-col items-center gap-2 pt-8">
      <span className="text-sm font-bold text-neutral-500">
        Or continue with
      </span>
      <div className="flex gap-3">
        <button className="cursor-pointer rounded-full bg-none p-2 hover:bg-black hover:bg-opacity-5">
          <a href={"http://localhost:3000/api/auth/callback/facebook"}>

            <Image
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-plain.svg"
              alt="login with facebook"
              className="w-10"
              width={40}
              height={40}
            />
          </a>
        </button>
        <button className="cursor-pointer rounded-full bg-none p-2 hover:bg-black hover:bg-opacity-5">
          <a href={"http://localhost:3000/api/auth/callback/google"}>
            <Image
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="login with google"
              className="w-10"
              width={40}
              height={40}
            />
          </a>
        </button>
        <button className="cursor-pointer rounded-full bg-none p-2 hover:bg-black hover:bg-opacity-5">
          <a href={"http://localhost:3000/api/auth/callback/github"}>
            <Image
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
              alt="login with github"
              className="w-10"
              width={40}
              height={40}
            />
          </a>
        </button>
      </div>
    </div>
  );
};

export default AlternateLogins;