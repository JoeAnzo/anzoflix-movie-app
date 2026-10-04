import GoogleIcon from "@/app/components/GoogleIcon";
import Logo from "@/app/components/Logo";
import { normalizeAuthError } from "@/app/helpers/AuthErrorNormalizer";
import {
  useGoogleAuthMutation,
  useSignInMutation,
} from "@/app/hooks/useAuthMutation";
import { LoginInput, loginSchema } from "@/app/schemas/auth.schema";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signInMutation = useSignInMutation(() => {
    router.replace("/(tabs)/home");
  });

  // 2. INITIALIZE GOOGLE HOOK WITH SAME ROUTING DESTINATION
  const googleAuthMutation = useGoogleAuthMutation(() => {
    router.replace("/(tabs)/home");
  });

  const onSubmit = (data: LoginInput) => {
    signInMutation.mutate(data);
  };

  // 3. CENTRALIZED PENDING STATE FOR DISABLING ACTIONS Safely
  const isAnyActionPending =
    signInMutation.isPending || googleAuthMutation.isPending;

  return (
    <ImageBackground
      source={require("../../../assets/images/cinemaHall.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      {/* Darkens the bright curtain lights while keeping the cinema visible. */}
      <View className="absolute inset-0 bg-black/55" />

      <View className="flex-1 justify-center p-6">
        <View className="mb-4 items-center justify-center">
          <Logo />
        </View>

        <Text className="text-sm text-left text-white mb-6">
          Sign in to your account to continue
        </Text>

        {/*
        We intentionally do not display raw backend strings here.
        The helper below sanitizes Appwrite errors into product-safe messages.
      */}

        {/* Email Input Field */}
        <View className="mb-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className={`flex-row items-center h-12 border rounded-lg px-3 bg-white ${
                  errors.email
                    ? "text-red-600 bg-red-50/30"
                    : "border-slate-300"
                }`}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#94a3b8"
                  className="mr-2"
                />
                <TextInput
                  className="flex-1 h-full text-base text-slate-800"
                  placeholder="Email Address"
                  placeholderTextColor="#94a3b8"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isAnyActionPending} // Freeze inputs while actions resolve
                />
              </View>
            )}
          />
          {errors.email && (
            <Text className="text-red-600 text-xs mt-1 ml-1 font-medium">
              {errors.email.message}
            </Text>
          )}
        </View>

        {/* Password Input Field */}
        <View className="mb-6">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className={`flex-row items-center h-12 border rounded-lg px-3 bg-white ${
                  errors.password
                    ? "text-red-600 bg-red-50/30"
                    : "border-slate-300"
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#94a3b8"
                  className="mr-2"
                />
                <TextInput
                  className="flex-1 h-full text-base text-slate-800"
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!isPasswordVisible}
                  editable={!isAnyActionPending}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={isAnyActionPending}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && (
            <Text className="text-[#E50914] text-xs mt-1 ml-1 font-medium">
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          className={`h-12 rounded-lg justify-center items-center ${
            signInMutation.isPending
              ? "bg-[#E50914] opacity-50"
              : "bg-[#E50914]"
          }`}
          activeOpacity={0.85}
          onPress={handleSubmit(onSubmit)}
          disabled={isAnyActionPending}
        >
          <Text className="text-white text-base font-bold">Sign In</Text>
        </TouchableOpacity>

        {/* Google Authentication Button Integration */}
        <TouchableOpacity
          className={`flex-row h-12 rounded-lg justify-center items-center bg-white mt-3 border border-slate-300 ${
            googleAuthMutation.isPending ? "opacity-70" : ""
          }`}
          activeOpacity={0.85}
          onPress={() => googleAuthMutation.mutate()} // 5. FIRE OFF GOOGLE MUTATION
          disabled={isAnyActionPending}
        >
          {googleAuthMutation.isPending ? (
            <ActivityIndicator color="#1e293b" />
          ) : (
            <>
              <GoogleIcon />
              <Text className="text-slate-800 text-base font-semibold">
                Sign in with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Navigation Redirect Link */}
        <View className="mt-6 flex-row justify-center">
          <Text className="text-white text-sm">
            Don&apos;t have an account?{" "}
          </Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity disabled={isAnyActionPending}>
              <Text className="text-red-600 text-sm font-semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
        {/*
        This is the critical UI rule: never render raw backend error strings.
        We normalize the error before displaying it to the user.
      */}
        {signInMutation.error && (
          <View className="first:mb-4">
            <Text className="text-red-600 text-center font-semibold text-sm">
              {normalizeAuthError(signInMutation.error)}
            </Text>
          </View>
        )}
        {googleAuthMutation.error && (
          <View className="mb-4">
            <Text className="text-red-600 text-center font-semibold text-sm">
              {normalizeAuthError(googleAuthMutation.error)}
            </Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}
