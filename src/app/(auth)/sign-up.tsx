import React, { useState } from "react";
import Logo from "@/app/components/Logo";
import { Text, TextInput, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { signUpSchema, SignUpInput } from "@/app/schemas/auth.schema";
import { useSignUpMutation,useGoogleAuthMutation} from '@/app/hooks/useAuthMutation';
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

const GoogleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" className="mr-3">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 3.01-6.69 3.01v2.51h10.83c3.99-3.67 6.92-9.08 6.92-15.37z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.87-3c-1.08.72-2.45 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-5.01H1.31v3.1C3.29 21.29 7.37 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.24 14.24a7.16 7.16 0 0 1 0-4.48v-3.1H1.31a11.94 11.94 0 0 0 0 10.68l3.93-3.1z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.37 0 3.29 2.71 1.31 6.66l3.93 3.1c.95-2.88 3.61-5.01 6.76-5.01z"
    />
  </Svg>
);

export default function SignUpScreen() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<SignUpInput>({
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
  const isAnyActionPending = signUpMutation.isPending || googleAuthMutation.isPending;

  return (
    <View className="flex-1 justify-center p-6 bg-black">
      <View className="mb-4 items-center justify-center">
        <Logo />
      </View>
      
      <Text className="text-sm text-left text-white mb-6">
        Create an account to get started
      </Text>

      {/* Global Credentials Sign-Up Error Alert */}
      {signUpMutation.error && (
        <View className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
          <Text className="text-red-600 text-center font-semibold text-sm">
            {signUpMutation.error.message}
          </Text>
        </View>
      )}

      {/* 4. GOOGLE INTERACTIVE MUTATION EXCEPTION ALERT */}
      {googleAuthMutation.error && (
        <View className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
          <Text className="text-red-600 text-center font-semibold text-sm">
            {googleAuthMutation.error.message || "Google sign-up encountered an unexpected issue."}
          </Text>
        </View>
      )}

      {/* Email Input Field */}
      <View className="mb-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View 
              className={`flex-row items-center h-12 border rounded-lg px-3 bg-white ${
                errors.email ? "border-red-500 bg-red-50/30" : "border-slate-300"
              }`}
            >
              <Ionicons name="mail-outline" size={20} color="#94a3b8" className="mr-2" />
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
          <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email.message}</Text>
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
                errors.password ? "border-red-500 bg-red-50/30" : "border-slate-300"
              }`}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" className="mr-2" />
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
          <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password.message}</Text>
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
                errors.confirmPassword ? "border-red-500 bg-red-50/30" : "border-slate-300"
              }`}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" className="mr-2" />
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
                onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isAnyActionPending}
              >
                <Ionicons 
                  name={isConfirmPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#94a3b8" 
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.confirmPassword && (
          <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.confirmPassword.message}</Text>
        )}
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        className={`h-12 rounded-lg justify-center items-center ${
          signUpMutation.isPending ? "bg-red-700/50" : "bg-[#E50914]"
        }`}
        activeOpacity={0.85} 
        onPress={handleSubmit(onSubmit)}
        disabled={isAnyActionPending}
      >
        {signUpMutation.isPending ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text className="text-white text-base font-bold">Sign Up</Text>
        )}
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
            <Text className="text-slate-800 text-base font-semibold">Sign up with Google</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Navigation Redirect Link */}
      <View className="mt-6 flex-row justify-center">
        <Text className="text-white text-sm">Already have an account? </Text>
        <Link href='/login' asChild>
          <TouchableOpacity disabled={isAnyActionPending}>
            <Text className="text-[#E50914] text-sm font-semibold">Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
