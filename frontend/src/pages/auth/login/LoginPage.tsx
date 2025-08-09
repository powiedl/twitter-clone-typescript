import { useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

import XSvg from '../../../components/svgs/X';

import { MdOutlineMail } from 'react-icons/md';
import { MdPassword } from 'react-icons/md';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApplicationError } from '../../../../../backend/types/express.types';
import toast from 'react-hot-toast';

interface IFormData {
  username: string;
  password: string;
}

const LoginPage = () => {
  const [formData, setFormData] = useState<IFormData>({
    username: '',
    password: '',
  });
  const queryClient = useQueryClient();

  const {
    mutate: loginMutation,
    isError,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (loginData: IFormData) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });
        const data = (await res.json()) as ApplicationError | IFormData;
        if (!res.ok) {
          if ('error' in data) {
            if (data.error) throw new Error(data.error);
          }
          throw new Error('Something went wrong');
        }
        if ('error' in data) throw new Error(data.error);
        return data;
      } catch (error) {
        console.log('Error in login,mutationFn', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Successfully logged in');
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation(formData);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className='max-w-screen-xl mx-auto flex h-screen'>
      <div className='flex-1 hidden lg:flex items-center  justify-center'>
        <XSvg className='lg:w-2/3 fill-white' />
      </div>
      <div className='flex-1 flex flex-col justify-center items-center'>
        <form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
          <XSvg className='w-24 lg:hidden fill-white' />
          <h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
          <label className='input input-bordered rounded flex items-center gap-2'>
            <MdOutlineMail />
            <input
              type='text'
              className='grow'
              placeholder='username'
              name='username'
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

          <label className='input input-bordered rounded flex items-center gap-2'>
            <MdPassword />
            <input
              type='password'
              className='grow'
              placeholder='Password'
              name='password'
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <button
            className='btn rounded-full btn-primary text-white'
            disabled={isPending}
          >
            {isPending ? 'Loading...' : 'Login'}
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
        <div className='flex flex-col gap-2 mt-4'>
          <p className='text-white text-lg'>{"Don't"} have an account?</p>
          <Link to='/signup'>
            <button className='btn rounded-full btn-primary text-white btn-outline w-full'>
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
