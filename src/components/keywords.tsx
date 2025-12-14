import { type InputRef, Flex, Input, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TweenOneGroup } from 'rc-tween-one';
import { useEffect, useRef, useState } from 'react';

import { getColor } from './utils';
import { type TagInfo } from '~types';

const tagGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 8,
  background: '#f0f0f0',
  maxHeight: 112,
  overflowY: 'scroll',
};

interface KeywordsProps {
  keywords: TagInfo[];
  toggleTips: (message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  saveKeywords: (payload: { keywords: TagInfo[] }) => void;
}
const Keywords = (props: KeywordsProps) => {
  const { keywords, toggleTips, saveKeywords } = props;
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleClose = (removedTag: string) => {
    const newTags = keywords.filter((tag) => tag.value !== removedTag);
    saveKeywords({ keywords: newTags });
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    const existTag = keywords.find((tag) => tag.value === inputValue);
    if (inputValue && existTag) {
      toggleTips('Keyword already exists', 'error');
      return;
    }
    if (inputValue && !existTag) {
      saveKeywords({ keywords: [...keywords, { color: getColor(), value: inputValue}] });
      toggleTips('The keyword has been added', 'success');
    }
    setInputVisible(false);
    setInputValue('');
  };

  const tagPlusStyle: React.CSSProperties = {
    background: '#fff',
    borderStyle: 'dashed',
  };

  return (
    <Flex gap="small" vertical>
      <h2>Keywords</h2>
      <TweenOneGroup
        appear={false}
        style={tagGroupStyle}
        enter={{ scale: 0.8, opacity: 0, type: 'from', duration: 100 }}
        leave={{ opacity: 0, width: 0, scale: 0, duration: 0 }}
        onEnd={(e) => {
          if (e.type === 'appear' || e.type === 'enter') {
            (e.target as any).style = 'display: inline-block';
          }
        }}
      >
        {keywords.map((tag, index) => (
          <Tag
            key={`${tag.value}-${index}`}
            closable
            color={tag.color}
            onClose={(e) => {
              e.preventDefault();
              handleClose(tag.value);
            }}
          >
            {tag.value}
          </Tag>
        ))}
      </TweenOneGroup>
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={{ width: '100%' }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <Tag onClick={showInput} style={tagPlusStyle}>
          <PlusOutlined /> Enter Keyword
        </Tag>
      )}
    </Flex>
  )
}

export default Keywords;