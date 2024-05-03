import React from 'react';
import './SearchCom.less';
import search from '../../assets/image/search.jpg';

const Header = () => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleSearchChange = event => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = event => {
        event.preventDefault();
        // You might want to call some function to handle the search
        console.log(`Searching for: ${searchTerm}`);
    };

    return (
        <div className="header">
            <h1 className="logo">Hulu AI —— 创造无限可能</h1>
            <div className="searchForm-wrapper">
                <div className="searchForm">
                    <input
                        type="text"
                        placeholder="请输入搜索内容"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="searchInput"
                    />
                    <div className='svg-wrapper'>
                        <svg
                            width="41"
                            height="41"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
                                fill="currentColor"
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                            ></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
