'use client';

import React, { useState } from 'react';

const Book = (props: {
  type: 'ASK' | 'BID',
}) => {
  const [bookData, setBookData] = useState<any[]>([1, 2, 3, 4, 5]);

  return (
    <ul>
      {bookData.map((data) => (
        <li className="relative grid grid-cols-5 mb-1 last:mb-0 px-1">
          <div className={`absolute top-0 bottom-0 left-0 -z-10 ${
            props.type === 'ASK' ? 'bg-red-300' : 'bg-green-300'
          }`} style={{ right: '33%' }}></div>
          <div className="col-span-1">2,600.0</div>
          <div className="col-span-2 text-right">172.3378</div>
          <div className="col-span-2 text-right">42,236.2924</div>
        </li>
      ))}
    </ul>
  );
};

const OrderBook = () => {
  return <div className="w-96 text-sm border border-black">
    <div className="flex justify-between px-1">
      <div>100</div>
      <div>ETH</div>
    </div>
    <div className="grid grid-cols-5 px-1">
      <div className="col-span-1">Price</div>
      <div className="col-span-2 text-right">Size (ETH)</div>
      <div className="col-span-2 text-right">Total (ETH)</div>
    </div>
    <div>
      <Book type="ASK" />
    </div>
    <div className="grid grid-cols-5 px-1">
      <div className="col-span-1 text-left">Spread</div>
      <div className="col-span-2 text-right">100.0</div>
      <div className="col-span-2 text-right">6.452%</div>
    </div>
    <div>
      <Book type="BID" />
    </div>
  </div>;
};

export default OrderBook;
