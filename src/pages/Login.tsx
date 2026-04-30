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
      "b999b3991c9e72a2af0f326fbe9cda3446e399c738ca2f600eec68c4d37b4425",
    role: "Admin",
  },
  {
    username: "user01@1cloudhub.com",
    password:
      "f72b33d1a80b869c3c67b946f31d365e11f65cc8301695ed9fdf912030468305",
    role: "User",
  },
  {
    username: "user02@1cloudhub.com",
    password:
      "025b5d1d8645562d412443af8628c8eee16e64b4d0967b604a92ae691514a90f",
    role: "User",
  },
  {
    username: "user03@1cloudhub.com",
    password:
      "7077a1c355903de212b2c362bde670af55f682d518c36c17c82fcf7ea4571fc3",
    role: "User",
  },
  {
    username: "user04@1cloud.com",
    password:
      "2a39c458b2d1a8ff21e1ab60c140e631e9fff4948cdb401218682a16dd242f0a",
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
