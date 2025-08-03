import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import type { ICreateUser } from '../../../../../backend/types/auth.types';
import type { ApplicationResponse } from '../../../../../backend/types/express.types';
import { MdOutlineMail } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import { MdPassword } from 'react-icons/md';
import { MdDriveFileRenameOutline } from 'react-icons/md';
import XSvg from '../../../components/svgs/X';
import toast from 'react-hot-toast';

const SignUpPage = () => {
  const [formData, setFormData] = useState<ICreateUser>({
    email: '',
    username: '',
    fullName: '',
    password: '',
  });

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async (newUser: ICreateUser) => {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });
        const data = (await res.json()) as ApplicationResponse<ICreateUser>;
        if (!res.ok) {
          if ('error' in data) {
            if (data.error) throw new Error(data.error as string);
          }
          throw new Error('Something went wrong');
        }
        if ('error' in data) throw new Error(data.error as string);
        return data;
      } catch (error) {
        console.log('Error in signup,mutationFn', error);
        throw error;
      }

      // #region Versuch message bei einem Error im Frontend anzuzeigen
      // let res;
      // try {
      //   res = await fetch('/api/auth/signup', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(newUser),
      //   });
      //   if (!res.ok) {
      //     throw new Error('Something went wrong');
      //   }
      //   const data = await res.json();
      //   if (data.error) throw new Error(data.error);
      //   return data;
      // } catch (error) {
      //   let errorData;
      //   try {
      //     if (res) errorData = await res.json();
      //     console.log('fetch signup, errorData', errorData);
      //     throw new Error(errorData.error);
      //   } catch (innerError) {
      //     throw innerError;
      //   }
      // }
      // #endregion
    },
    onSuccess: () => {
      toast.success('Account created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className='max-w-screen-xl mx-auto flex h-screen px-10'>
      <div className='flex-1 hidden lg:flex items-center  justify-center'>
        <XSvg className=' lg:w-2/3 fill-white' />
      </div>
      <div className='flex-1 flex flex-col justify-center items-center'>
        <form
          className='lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col'
          onSubmit={handleSubmit}
        >
          <XSvg className='w-24 lg:hidden fill-white' />
          <h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
          <label className='input input-bordered rounded flex items-center gap-2'>
            <MdOutlineMail />
            <input
              type='email'
              className='grow'
              placeholder='Email'
              name='email'
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>
          <div className='flex gap-4 flex-wrap'>
            <label className='input input-bordered rounded flex items-center gap-2'>
              <FaUser />
              <input
                type='text'
                className='grow '
                placeholder='Username'
                name='username'
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>
            <label className='input input-bordered rounded flex items-center gap-2'>
              <MdDriveFileRenameOutline />
              <input
                type='text'
                className='grow'
                placeholder='Full Name'
                name='fullName'
                onChange={handleInputChange}
                value={formData.fullName}
              />
            </label>
          </div>
          <label className='input input-bordered rounded flex items-center gap-2'>
            <MdPassword />
            <input
              type='password'
              className='grow'
              placeholder='Password'
              name='password'
              onChange={handleInputChange}
              value={formData.password}
              disabled={isPending}
            />
          </label>
          <button className='btn rounded-full btn-primary text-white'>
            {isPending ? 'Loading...' : 'Sign up'}
          </button>
          {isError && (
            <p className='text-red-500'>
              Something went wrong{' '}
              {error?.message !== 'Something went wrong'
                ? `(${error.message})`
                : ''}
            </p>
          )}
        </form>
        <div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
          <p className='text-white text-lg'>Already have an account?</p>
          <Link to='/login'>
            <button className='btn rounded-full btn-primary text-white btn-outline w-full'>
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
