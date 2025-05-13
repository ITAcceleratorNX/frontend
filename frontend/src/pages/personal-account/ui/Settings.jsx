import React from 'react';

const Settings = () => (
  <div className="w-full flex justify-center items-center min-h-[80vh] font-['Montserrat']">
    <div className="mb-20 bg-white border border-[#66666659] rounded-xl w-full px-20 py-8 mx-4">
      <h2 className="text-2xl font-bold text-[#222] mb-10">СМЕНИТЬ ПАРОЛЬ</h2>
      <form className="flex flex-col gap-8 mb-12">
        <div className="flex items-center gap-10">
          <label className="uppercase text-[#6B6B6B] text-[15px] font-normal w-[260px] text-left tracking-wider">
            Введите старый пароль
          </label>
          <input
            type="password"
            className="w-[370px] h-12 border border-[#66666659] rounded-lg px-4 text-[16px] font-normal text-[#222] bg-white focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-10">
          <label className="uppercase text-[#6B6B6B] text-[15px] font-normal w-[260px] text-left tracking-wider">
            Введите новый пароль
          </label>
          <input
            type="password"
            className="w-[370px] h-12 border border-[#66666659] rounded-lg px-4 text-[16px] font-normal text-[#222] bg-white focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-10">
          <label className="uppercase text-[#6B6B6B] text-[15px] font-normal w-[260px] text-left tracking-wider">
            Повторите новый пароль
          </label>
          <input
            type="password"
            className="w-[370px] h-12 border border-[#66666659] rounded-lg px-4 text-[16px] font-normal text-[#222] bg-white focus:outline-none"
          />
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="mr-24 bg-[#273655] text-white text-[16px] font-normal rounded-full px-6 py-2 shadow-none hover:bg-[#1d2742] transition"
          >
            СМЕНИТЬ ПАРОЛЬ
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default Settings; 