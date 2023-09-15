import React from 'react'

export function Loading() {
    return (
        <div className='loader'>
            <div className='loader--dot'></div>
            <div className='loader--dot'></div>
            <div className='loader--dot'></div>
            <div className='loader--dot'></div>
            <div className='loader--dot'></div>
            <div className='loader--dot'></div>
            <div className='loader--text'></div>
        </div>
    )
}

export default Loading