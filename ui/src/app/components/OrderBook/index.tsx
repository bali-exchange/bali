'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

interface BookRow {
  px: string;
  sz: string;
  tt?: string;
  n: number,
}

const formatNumber = (num: number | string, fractionDigits = 4) => {
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};

const Book = (props: {
  type: 'ASK' | 'BID',
  rows: BookRow[],
  limit: number,
}) => {
  const rows = useMemo(() => {
    const pxFractionDigits = Math.max(...props.rows.map((row) => row.px.split('.')[1]?.length ?? 0));
    const szFractionDigits = Math.max(...props.rows.map((row) => row.sz.split('.')[1]?.length ?? 0));
    let sum = 0;
    const result = props.rows.slice(0, props.limit).map((row) => {
      sum += Number(row.sz);
      return {
        px: formatNumber(row.px, pxFractionDigits),
        sz: formatNumber(row.sz, szFractionDigits),
        tt: formatNumber(sum, szFractionDigits),
        n: row.n,
      };
    });
    return props.type === 'ASK' ? result.reverse() : result;
  }, [props.type, props.rows, props.limit]);

  return (
    <ul>
      {rows.map((row) => (
        <li className="relative grid grid-cols-5 mb-1 last:mb-0 px-1">
          <div className={`absolute top-0 bottom-0 left-0 -z-10 ${
            props.type === 'ASK' ? 'bg-red-300' : 'bg-green-300'
          }`} style={{ right: '33%' }}></div>
          <div className="col-span-1 hover:font-medium">{row.px}</div>
          <div className="col-span-2 text-right hover:font-medium">{row.sz}</div>
          <div className="col-span-2 text-right hover:font-medium">{row.tt}</div>
        </li>
      ))}
    </ul>
  );
};

const OrderBook = () => {
  const [askBookRows, setAskBookRows] = useState<BookRow[]>([]);
  const [bidBookRows, setBidBookRows] = useState<BookRow[]>([]);

  const spread = useMemo(() => {
    return Number(askBookRows[0]?.px) - Number(bidBookRows[0]?.px);
  }, [askBookRows, bidBookRows]);

  const spreadPercentage = useMemo(() => {
    const avgPx = (Number(askBookRows[0]?.px) + Number(bidBookRows[0]?.px)) / 2;
    return Number((0.1 / avgPx * 100).toFixed(3)) + '%';
  }, [askBookRows, bidBookRows]);

  useEffect(() => {
    const socket = new WebSocket('wss://api-ui.hyperliquid.xyz/ws');

    socket.onopen = () => {
      socket.send(JSON.stringify({
        method: 'subscribe',
        subscription: {
          type: 'l2Book',
          coin: 'ETH',
          nSigFigs: null,
        },
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.channel === 'l2Book') {
          setAskBookRows(data.data.levels[1]);
          setBidBookRows(data.data.levels[0]);
        }
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return <div className="w-96 text-sm border border-black">
    <div className="flex justify-between px-1 mt-0.5 font-semibold">
      <div>100</div>
      <div>ETH</div>
    </div>
    <div className="grid grid-cols-5 px-1 my-0.5 font-semibold">
      <div className="col-span-1">Price</div>
      <div className="col-span-2 text-right">Size (ETH)</div>
      <div className="col-span-2 text-right">Total (ETH)</div>
    </div>
    <div>
      <Book type="ASK" rows={askBookRows} limit={11} />
    </div>
    <div className="grid grid-cols-5 px-1 my-0.5 font-medium">
      <div className="col-span-1 text-left">Spread</div>
      <div className="col-span-2 text-right">{spread}</div>
      <div className="col-span-2 text-right">{spreadPercentage}</div>
    </div>
    <div>
      <Book type="BID" rows={bidBookRows} limit={11} />
    </div>
  </div>;
};

export default OrderBook;
