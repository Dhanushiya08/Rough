import customerLogo from "../assets/image 1.png";
import companyLogo from "../assets/image 2.png";
import { Card, Input, Button } from "antd";
import { Controller, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import CryptoJS from "crypto-js";

const sampleUsers = [
  {
    username: "admin@1cloudhub.com",
    password: CryptoJS.SHA256("admin123").toString(),
    role: "Admin",
  },
  {
    username: "user01@1cloudhub.com",
    password: CryptoJS.SHA256("user01123").toString(),
    role: "User",
  },
  {
    username: "user02@1cloudhub.com",
    password: CryptoJS.SHA256("user02123").toString(),
    role: "User",
  },
  {
    username: "user03@1cloudhub.com",
    password: CryptoJS.SHA256("user03123").toString(),
    role: "User",
  },
  {
    username: "user04@1cloud.com",
    password: CryptoJS.SHA256("user04123").toString(),
    role: "User",
  },
];
// const sampleUsers = [
//   {
//     username: "admin@1cloudhub.com",
//     password: "admin123",
//     role: "Admin",
//   },
//   {
//     username: "user01@1cloudhub.com",
//     password: "user01123",
//     role: "User",
//   },
//   {
//     username: "user02@1cloudhub.com",
//     password: "user02123",
//     role: "User",
//   },
//   {
//     username: "user03@1cloudhub.com",
//     password: "user03123",
//     role: "User",
//   },
//   {
//     username: "user04@1cloudhub.com",
//     password: "user04123",
//     role: "User",
//   },
// ];

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
    // const matchedUser = sampleUsers.find(
    //   (user) =>
    //     user.username === data.username && user.password === data.password,
    // );
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
