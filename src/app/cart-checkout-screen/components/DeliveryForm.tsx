'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, MapPin, ChevronRight } from 'lucide-react';

interface DeliveryFormData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'home' | 'farm' | 'office';
}

interface DeliveryFormProps {
  onSubmit: (data: Record<string, string>) => void;
  onBack: () => void;
}

const indianStates = [
  'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka',
  'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other',
];

export default function DeliveryForm({ onSubmit, onBack }: DeliveryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryFormData>({
    defaultValues: {
      fullName: 'Rajan Kumar',
      phone: '9876543210',
      addressLine1: 'Survey No. 142, Near Gram Panchayat Office',
      addressLine2: 'Malwadi Village',
      landmark: 'Behind SBI Bank',
      city: 'Ahmednagar',
      state: 'Maharashtra',
      pincode: '414001',
      addressType: 'farm',
    },
  });

  const handleFormSubmit = async (data: DeliveryFormData) => {
    await new Promise((r) => setTimeout(r, 400));
    onSubmit(data as unknown as Record<string, string>);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-2 mb-5">
          <MapPin size={18} className="text-primary" />
          <h2 className="font-bold text-foreground">Delivery Address</h2>
        </div>

        {/* Address type */}
        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-sm font-semibold text-foreground">Address type</label>
          <div className="flex gap-3">
            {(['home', 'farm', 'office'] as const).map((type) => (
              <label key={`addr-type-${type}`} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={type}
                  className="accent-primary"
                  {...register('addressType')}
                />
                <span className="text-sm font-medium text-foreground capitalize">
                  {type === 'farm' ? '🌾 Farm' : type === 'home' ? '🏠 Home' : '🏢 Office'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="del-name" className="text-sm font-semibold text-foreground">
              Full name <span className="text-danger">*</span>
            </label>
            <input
              id="del-name"
              type="text"
              className={`input-base ${errors.fullName ? 'border-red-400' : ''}`}
              placeholder="Rajan Kumar"
              {...register('fullName', { required: 'Full name is required' })}
            />
            {errors.fullName && <p className="text-xs text-red-600 font-medium">{errors.fullName.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="del-phone" className="text-sm font-semibold text-foreground">
              Mobile number <span className="text-danger">*</span>
            </label>
            <p className="text-xs text-muted-foreground">Delivery agent will call on this number</p>
            <input
              id="del-phone"
              type="tel"
              className={`input-base ${errors.phone ? 'border-red-400' : ''}`}
              placeholder="9876543210"
              {...register('phone', {
                required: 'Phone is required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit number' },
              })}
            />
            {errors.phone && <p className="text-xs text-red-600 font-medium">{errors.phone.message}</p>}
          </div>
        </div>

        {/* Address line 1 */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label htmlFor="del-addr1" className="text-sm font-semibold text-foreground">
            Address line 1 <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-muted-foreground">House / Survey No., Street, Village</p>
          <input
            id="del-addr1"
            type="text"
            className={`input-base ${errors.addressLine1 ? 'border-red-400' : ''}`}
            placeholder="Survey No. 142, Main Road"
            {...register('addressLine1', { required: 'Address line 1 is required' })}
          />
          {errors.addressLine1 && <p className="text-xs text-red-600 font-medium">{errors.addressLine1.message}</p>}
        </div>

        {/* Address line 2 + Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="del-addr2" className="text-sm font-semibold text-foreground">
              Address line 2
              <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="del-addr2"
              type="text"
              className="input-base"
              placeholder="Village / Colony name"
              {...register('addressLine2')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="del-landmark" className="text-sm font-semibold text-foreground">
              Landmark
              <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <p className="text-xs text-muted-foreground">Helps delivery agent locate you</p>
            <input
              id="del-landmark"
              type="text"
              className="input-base"
              placeholder="Near school / temple"
              {...register('landmark')}
            />
          </div>
        </div>

        {/* City + State + Pincode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="del-city" className="text-sm font-semibold text-foreground">
              City / Taluka <span className="text-danger">*</span>
            </label>
            <input
              id="del-city"
              type="text"
              className={`input-base ${errors.city ? 'border-red-400' : ''}`}
              placeholder="Ahmednagar"
              {...register('city', { required: 'City is required' })}
            />
            {errors.city && <p className="text-xs text-red-600 font-medium">{errors.city.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="del-state" className="text-sm font-semibold text-foreground">
              State <span className="text-danger">*</span>
            </label>
            <select
              id="del-state"
              className={`input-base ${errors.state ? 'border-red-400' : ''}`}
              {...register('state', { required: 'State is required' })}
            >
              <option value="">Select state</option>
              {indianStates.map((s) => (
                <option key={`del-state-${s}`} value={s}>{s}</option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-red-600 font-medium">{errors.state.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="del-pincode" className="text-sm font-semibold text-foreground">
              Pincode <span className="text-danger">*</span>
            </label>
            <p className="text-xs text-muted-foreground">6-digit pincode</p>
            <input
              id="del-pincode"
              type="text"
              className={`input-base ${errors.pincode ? 'border-red-400' : ''}`}
              placeholder="414001"
              {...register('pincode', {
                required: 'Pincode is required',
                pattern: { value: /^\d{6}$/, message: 'Enter valid 6-digit pincode' },
              })}
            />
            {errors.pincode && <p className="text-xs text-red-600 font-medium">{errors.pincode.message}</p>}
          </div>
        </div>
      </div>

      {/* Delivery estimate notice */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-green-600 text-base shrink-0 mt-0.5">🚚</span>
        <div>
          <p className="text-sm font-semibold text-green-800">Estimated delivery: 3–5 business days</p>
          <p className="text-xs text-green-700 mt-0.5">
            Delivery available across 500+ pincodes in Maharashtra, Punjab, UP, and 8 other states.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary flex-1 py-3"
        >
          Back to Cart
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 font-bold"
          style={{ minHeight: 52 }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue to Payment
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}