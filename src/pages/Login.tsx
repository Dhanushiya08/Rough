import customerLogo from "../assets/image 1.png";
import companyLogo from "../assets/image 2.png";
import { Card, Input, Button } from "antd";
import { Controller, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import CryptoJS from "crypto-js";

// CryptoJS.SHA256("pwd").toString();
const sampleUsers = [
  {
    username: "admin@1cloudhub.com",
    password:
      // "1a8e2cf3d6e1e7a00cdbe5899319e2cef16c5138d30355360dc4f8540de9dbcd",
      "b999b3991c9e72a2af0f326fbe9cda3446e399c738ca2f600eec68c4d37b4425",
    role: "Admin",
  },
  {
    username: "user01@1cloudhub.com",
    password:
      // "951444067dc2a7ca8a889fb37ccf297e817c2c0fe237282202785225bdfbc546",
      "f72b33d1a80b869c3c67b946f31d365e11f65cc8301695ed9fdf912030468305",

    role: "User",
  },
  {
    username: "user02@1cloudhub.com",
    password:
      // "6cbd99a8a92120e95e9336a3a5880b52c11fd14e18630331bf019d014a135ed0",
      "025b5d1d8645562d412443af8628c8eee16e64b4d0967b604a92ae691514a90f",
    role: "User",
  },
  {
    username: "user03@1cloudhub.com",
    password:
      // "8feecc892ecd04f888e944be1c44c4ab0f5f331042fe0d219b16ce9fa9563b11",
      "7077a1c355903de212b2c362bde670af55f682d518c36c17c82fcf7ea4571fc3",
    role: "User",
  },
  {
    username: "user04@1cloudhub.com",
    password:
      // "3bf30b02d7113bccc538409492d228262f0eca8bd01854b84818db8f510241b3",
      "2a39c458b2d1a8ff21e1ab60c140e631e9fff4948cdb401218682a16dd242f0a",
    role: "User",
  },
  {
    username: "anton_hermanto@eastglobal.biz",
    password:
      "6f46181a8f4706c26cf7d0775b74098aad73bcd58060a87f973ff88d003ecfb3",
    role: "User",
  },
  {
    username: "fakhri_aufar@eastglobal.biz",
    password:
      "32d3c4b451918d603d2be22a0775691fba2729edbdf051ba77aab5a27699be65",
    role: "User",
  },
  {
    username: "margaret_limawan@eastglobal.biz",
    password:
      "9bea93702520e36b27216c824f8751c9f456070fff92bc763589f10cc7c37a32",
    role: "User",
  },
  {
    username: "nurkhafeezah_khalid@averis.com",
    password:
      "faaece25709e98ea7023955979180a84e91110b6957ff882701cb08430c78416",
    role: "User",
  },
  {
    username: "peiyin_chang@averis.com",
    password:
      "afeca9aebc21a07ddbb934060a1716b714489f77ae404f7022ce4668917eea98",
    role: "User",
  },
  {
    username: "carlmen_low@averis.com",
    password:
      "a62c63c2fdb9dda16030c909f34ea6cdfffc7a8c8593abe27846ce7aae8f7c55",
    role: "User",
  },
  {
    username: "shityiing_kok@averis.com",
    password:
      "925966bc9dbd7e0c68b247540d6514c25c6ac0ad0b4f66623bd5b10c0be8e2e3",
    role: "User",
  },
  {
    username: "caini_chau@averis.com",
    password:
      "cc8ec59bebf1be0e62b6000d36568c42a52fdc240d2fccb420504c4783bf1abf",
    role: "User",
  },
  {
    username: "hsiawen_khor@averis.com",
    password:
      "661861473f5c9a47b1b5b6ed5938a2184453a83333f309a4146e1b8cb81e66e2",
    role: "User",
  },
  {
    username: "yoonahnjohn_lian@averis.com",
    password:
      "119e0c4aa6ffd503cb29fee97839ba0b0050d1a19bfe46c77b6bfbe55a6f995b",
    role: "User",
  },
  {
    username: "kahheng_yap@pacificenergycorp.com",
    password:
      "e68981ed88822e35f0b8255adff6e92ad2e5b3c974ae0efef5b6e71f6c7e829f",
    role: "User",
  },
  {
    username: "peknee_chiu@averis.com",
    password:
      "7c9df89c7e257775d5127c59b23af1cd1e1a5535e9da47622cd7f3cb55dbf074",
    role: "User",
  },
];

type UserType = {
  username: string;
  password: string;
  role: string;
};

type LoginPageProps = {
  onLogin: (user: UserType) => void;
};

type LoginFormValues = {
  username: string;
  password: string;
};

export default function LoginPage({ onLogin }: LoginPageProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    const hashedPassword = CryptoJS.SHA256(data.password).toString();
    const matchedUser = sampleUsers.find(
      (user) =>
        user.username === data.username && user.password === hashedPassword,
    );
    console.log(hashedPassword);
    console.log(matchedUser);
    if (matchedUser) {
      onLogin(matchedUser);
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Toaster position="top-right" />

      <Card className="w-full max-w-md rounded-2xl shadow-lg border-0">
        <div className="flex flex-col items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <img
              src={customerLogo}
              alt="Customer Logo"
              className="max-h-8 md:max-h-10 lg:max-h-12 w-auto object-contain"
            />

            <div className="h-6 md:h-8 w-px bg-borderer" />

            <img
              src={companyLogo}
              alt="Company Logo"
              className="max-h-8 md:max-h-10 lg:max-h-12 w-auto object-contain"
            />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Login</h1>
            <p className="text-borderer">Sign in to your account to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div>
            <Controller
              name="username"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              }}
              render={({ field }) => (
                <Input {...field} size="large" placeholder="Email Address" />
              )}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div>
            <Controller
              name="password"
              control={control}
              rules={{ required: "Password is required" }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  placeholder="Password"
                />
              )}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            htmlType="submit"
            type="primary"
            size="large"
            block
            className="!bg-primary"
          >
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
}
