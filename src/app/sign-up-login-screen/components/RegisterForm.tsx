'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthRole } from './AuthShell';
import Link from 'next/link';

interface UserRegisterData {
  fullName: string;
  phone: string;
  email: string;
  pincode: string;
  state: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface VendorRegisterData extends UserRegisterData {
  businessName: string;
  gstNumber: string;
  businessAddress: string;
  productCategories: string;
}

interface RegisterFormProps {
  role: AuthRole;
}

const indianStates = [
  'Andhra Pradesh',
  'Bihar',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Madhya Pradesh',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Other',
];

const productCategoryOptions = [
  'Fertilizers',
  'Seeds',
  'Pesticides',
  'Farming Tools',
  'Irrigation',
  'Organic Products',
];

export default function RegisterForm({ role }: RegisterFormProps) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VendorRegisterData>({ defaultValues: { state: '', productCategories: '' } });

  const password = watch('password');

  const onSubmit = async (data: VendorRegisterData) => {
    setLoading(true);
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        vendor: role === 'vendor' ? data.businessName : undefined,
      }),
    });
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">
            {role === 'vendor' || role === 'employee' ? 'Application Submitted!' : 'Account Created!'}
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            {role === 'vendor' || role === 'employee'
              ? 'Your account application is under admin review. You can sign in after approval.'
              : 'Your account has been created. You can now sign in.'}
          </p>
        </div>
        <Link href="/" className="btn-primary flex items-center gap-2 mt-1">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Vendor approval notice */}
      {(role === 'vendor' || role === 'employee') && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800">Approval Required</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {role === 'vendor' ? 'Vendor' : 'Delivery'} accounts require admin approval. You can log in only after approval.
            </p>
          </div>
        </div>
      )}

      {/* Full name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-name" className="text-sm font-semibold text-foreground">
          Full name
        </label>
        <input
          id="reg-name"
          type="text"
          className={`input-base ${errors.fullName ? 'border-red-400' : ''}`}
          placeholder="Rajan Kumar"
          {...register('fullName', {
            required: 'Full name is required',
            minLength: { value: 2, message: 'At least 2 characters' },
          })}
        />
        {errors.fullName && (
          <p className="text-xs text-red-600 font-medium">{errors.fullName.message}</p>
        )}
      </div>

      {/* Vendor: Business name */}
      {role === 'vendor' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-business" className="text-sm font-semibold text-foreground">
            Business / Shop name
          </label>
          <input
            id="reg-business"
            type="text"
            className={`input-base ${errors.businessName ? 'border-red-400' : ''}`}
            placeholder="Green Fields Seeds & Fertilizers"
            {...register('businessName', { required: 'Business name is required' })}
          />
          {errors.businessName && (
            <p className="text-xs text-red-600 font-medium">{errors.businessName.message}</p>
          )}
        </div>
      )}

      {/* Phone + Email row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-phone" className="text-sm font-semibold text-foreground">
            Mobile number
          </label>
          <input
            id="reg-phone"
            type="tel"
            className={`input-base ${errors.phone ? 'border-red-400' : ''}`}
            placeholder="9876543210"
            {...register('phone', {
              required: 'Phone is required',
              pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit number' },
            })}
          />
          {errors.phone && (
            <p className="text-xs text-red-600 font-medium">{errors.phone.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-email" className="text-sm font-semibold text-foreground">
            Email address
          </label>
          <input
            id="reg-email"
            type="email"
            className={`input-base ${errors.email ? 'border-red-400' : ''}`}
            placeholder="your@email.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
            })}
          />
          {errors.email && (
            <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Pincode + State */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-pincode" className="text-sm font-semibold text-foreground">
            Pincode
          </label>
          <input
            id="reg-pincode"
            type="text"
            className={`input-base ${errors.pincode ? 'border-red-400' : ''}`}
            placeholder="411001"
            {...register('pincode', {
              required: 'Pincode required',
              pattern: { value: /^\d{6}$/, message: '6-digit pincode' },
            })}
          />
          {errors.pincode && (
            <p className="text-xs text-red-600 font-medium">{errors.pincode.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-state" className="text-sm font-semibold text-foreground">
            State
          </label>
          <select
            id="reg-state"
            className={`input-base ${errors.state ? 'border-red-400' : ''}`}
            {...register('state', { required: 'Select your state' })}
          >
            <option value="">Select state</option>
            {indianStates.map((s) => (
              <option key={`state-${s}`} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-xs text-red-600 font-medium">{errors.state.message}</p>
          )}
        </div>
      </div>

      {/* Vendor: GST + Address */}
      {role === 'vendor' && (
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-gst" className="text-sm font-semibold text-foreground">
              GST Number
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                (optional but recommended)
              </span>
            </label>
            <input
              id="reg-gst"
              type="text"
              className="input-base"
              placeholder="22AAAAA0000A1Z5"
              {...register('gstNumber')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-bizaddr" className="text-sm font-semibold text-foreground">
              Business address
            </label>
            <textarea
              id="reg-bizaddr"
              rows={2}
              className={`input-base resize-none ${errors.businessAddress ? 'border-red-400' : ''}`}
              placeholder="Shop No. 12, Krishi Mandi, Pune 411001"
              {...register('businessAddress', { required: 'Business address is required' })}
            />
            {errors.businessAddress && (
              <p className="text-xs text-red-600 font-medium">{errors.businessAddress.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-categories" className="text-sm font-semibold text-foreground">
              Product categories you sell
            </label>
            <p className="text-xs text-muted-foreground">Select the primary category</p>
            <select
              id="reg-categories"
              className={`input-base ${errors.productCategories ? 'border-red-400' : ''}`}
              {...register('productCategories', { required: 'Select a category' })}
            >
              <option value="">Select category</option>
              {productCategoryOptions.map((c) => (
                <option key={`cat-${c}`} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.productCategories && (
              <p className="text-xs text-red-600 font-medium">{errors.productCategories.message}</p>
            )}
          </div>
        </>
      )}

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-sm font-semibold text-foreground">
          Password
        </label>
        <p className="text-xs text-muted-foreground">
          Minimum 8 characters with a number and special character
        </p>
        <div className="relative">
          <input
            id="reg-password"
            type={showPw ? 'text' : 'password'}
            className={`input-base pr-10 ${errors.password ? 'border-red-400' : ''}`}
            placeholder="Create a strong password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
              pattern: {
                value: /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
                message: 'Include a number and special character',
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-confirm" className="text-sm font-semibold text-foreground">
          Confirm password
        </label>
        <div className="relative">
          <input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            className={`input-base pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
            placeholder="Repeat your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === password || 'Passwords do not match',
            })}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms */}
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 mt-0.5 rounded border-border accent-primary"
          {...register('terms', { required: 'You must accept the terms' })}
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I agree to earthly's{' '}
          <span className="text-primary font-semibold cursor-pointer hover:underline">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="text-primary font-semibold cursor-pointer hover:underline">
            Privacy Policy
          </span>
        </span>
      </label>
      {errors.terms && (
        <p className="text-xs text-red-600 font-medium -mt-2">{errors.terms.message}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-1"
        style={{ minHeight: 48 }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {role === 'vendor' || role === 'employee' ? 'Submitting application...' : 'Creating account...'}
          </>
        ) : role === 'vendor' ? (
          'Submit Vendor Application'
        ) : role === 'employee' ? (
          'Submit Delivery Application'
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
}
