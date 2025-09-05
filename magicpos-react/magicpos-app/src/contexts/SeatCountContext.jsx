import React, { createContext, useContext, useState } from 'react';

const SeatCountContext = createContext();

export const useSeatCount = () => useContext(SeatCountContext);

export const SeatCountProvider = ({ children }) => {
  const [seatCount, setSeatCount] = useState(0);
  return (
    <SeatCountContext.Provider value={{ seatCount, setSeatCount }}>
      {children}
    </SeatCountContext.Provider>
  );
};
