import GoogleIcon from "@/app/components/GoogleIcon";
import Logo from "@/app/components/Logo";
import { normalizeAuthError } from "@/app/helpers/AuthErrorNormalizer";
import {
  useGoogleAuthMutation,
  useSignUpMutation,
} from "@/app/hooks/useAuthMutation";
import { SignUpInput, signUpSchema } from "@/app/schemas/auth.schema";
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

export default function SignUpScreen() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const signUpMutation = useSignUpMutation(() => {
    router.replace("/(tabs)/home");
  });

  // 2. INITIALIZE GOOGLE AUTH HOOK WITH REDIRECT ROUTING
  const googleAuthMutation = useGoogleAuthMutation(() => {
    router.replace("/(tabs)/home");
  });

  const onSubmit = (data: SignUpInput) => {
    signUpMutation.mutate(data);
  };

  // 3. COMBINE PENDING STATES TO DISABLE BUTTON INTERACTIONS UNTIL PROCESSES RESOLVE
  const isAnyActionPending =
    signUpMutation.isPending || googleAuthMutation.isPending;

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
          Create an account to get started
        </Text>

        {/* Email Input Field */}
        <View className="mb-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className={`flex-row items-center h-12 border rounded-lg px-3 bg-white ${
                  errors.email
                    ? "border-red-500 bg-red-50/30"
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
                  editable={!isAnyActionPending} // Intercept typed entry input text events during processing
                />
              </View>
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">
              {errors.email.message}
            </Text>
          )}
        </View>

        {/* Password Input Field */}
        <View className="mb-4">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className={`flex-row items-center h-12 border rounded-lg px-3 bg-white ${
                  errors.password
                    ? "border-red-500 bg-red-50/30"
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
            <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Confirm Password Input Field */}
        <View className="mb-6">
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View
                className={`flex-row items-center h-12 border rounded-lg px-3 bg-white ${
                  errors.confirmPassword
                    ? "border-red-500 bg-red-50/30"
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
                  placeholder="Confirm Password"
                  placeholderTextColor="#94a3b8"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!isConfirmPasswordVisible}
                  editable={!isAnyActionPending}
                />
                <TouchableOpacity
                  onPress={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={isAnyActionPending}
                >
                  <Ionicons
                    name={
                      isConfirmPasswordVisible
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.confirmPassword && (
            <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">
              {errors.confirmPassword.message}
            </Text>
          )}
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          className={`h-12 rounded-lg justify-center items-center ${
            signUpMutation.isPending
              ? "bg-[#E50914] opacity-50"
              : "bg-[#E50914]"
          }`}
          activeOpacity={0.85}
          onPress={handleSubmit(onSubmit)}
          disabled={isAnyActionPending}
        >
          <Text className="text-white text-base font-bold">Sign Up</Text>
        </TouchableOpacity>

        {/* Google Authentication Sign Up Integration Button */}
        <TouchableOpacity
          className={`flex-row h-12 rounded-lg justify-center items-center bg-white mt-3 border border-slate-300 ${
            googleAuthMutation.isPending ? "opacity-70" : ""
          }`}
          activeOpacity={0.85}
          onPress={() => googleAuthMutation.mutate()} // 5. EVENT FIRE ON GOOGLE SIGN UP SELECTION
          disabled={isAnyActionPending}
        >
          {googleAuthMutation.isPending ? (
            <ActivityIndicator color="#1e293b" />
          ) : (
            <>
              <GoogleIcon />
              <Text className="text-slate-800 text-base font-semibold">
                Sign up with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Navigation Redirect Link */}
        <View className="mt-6 flex-row justify-center">
          <Text className="text-white text-sm">Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity disabled={isAnyActionPending}>
              <Text className="text-[#E50914] text-sm font-semibold">
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
        {/*
        Keep errors user-safe: raw backend details are never shown in the UI.
        This keeps the app professional and avoids leaking backend implementation info.
      */}
        {googleAuthMutation.error && (
          <View className="mb-4">
            <Text className="text-red-600 text-center font-semibold text-sm">
              {normalizeAuthError(googleAuthMutation.error)}
            </Text>
          </View>
        )}
        {/* Global Credentials Sign-Up Error Alert */}
        {signUpMutation.error && (
          <View className="mb-4">
            <Text className="text-red-600 text-center font-semibold text-sm">
              {normalizeAuthError(signUpMutation.error)}
            </Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}
