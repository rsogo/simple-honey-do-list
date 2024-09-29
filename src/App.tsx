import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Container, TextField, Typography, Select, MenuItem, Box, TextareaAutosize, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import 'react-toastify/dist/ReactToastify.css';

interface Item {
  name: string;
  priority: '必須' | 'いつか買う';
  checked: boolean;
}

const useStyles = makeStyles({
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  select: {
    width: '40%', // 横幅を40%に設定
  },
  formControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem', // アイテム間のスペースを設定
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  checkedItem: {
    textDecoration: 'line-through',
  },
  bulkAddContainer: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  button: {
    marginTop: '1rem',
  },
});

const App: React.FC = () => {
  const classes = useStyles();
  const [items, setItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPriority, setItemPriority] = useState<'必須' | 'いつか買う'>('必須');
  const [bulkText, setBulkText] = useState('');

  useEffect(() => {
    const savedItems = localStorage.getItem('shoppingList');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(items));
  }, [items]);

  const handleAddItem = (event: React.FormEvent) => {
    event.preventDefault();
    const newItem: Item = { name: itemName, priority: itemPriority, checked: false };
    setItems([...items, newItem]);
    setItemName('');
    setItemPriority('必須');
  };

  const handleBulkAdd = () => {
    const newItems: Item[] = bulkText.split(/[\n、。]/).filter(item => item.trim() !== '').map(item => ({
      name: item.trim(),
      priority: '必須',
      checked: false,
    }));
    setItems([...items, ...newItems]);
    setBulkText('');
  };

  const handleCheckItem = (index: number) => {
    const newItems = [...items];
    const [checkedItem] = newItems.splice(index, 1);
    checkedItem.checked = !checkedItem.checked;
    if (checkedItem.checked) {
      newItems.push(checkedItem);
    } else {
      newItems.unshift(checkedItem);
    }
    setItems(newItems);
  };

  const generateShareableURL = () => {
    const encodedItems = encodeURIComponent(JSON.stringify(items));
    return `${window.location.origin}${window.location.pathname}?list=${encodedItems}`;
  };

  const handleShare = () => {
    const url = generateShareableURL();
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URLをクリップボードにコピーしました');
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const list = params.get('list');
    if (list) {
      setItems(JSON.parse(decodeURIComponent(list)));
    }
  }, []);

  return (
    <Container>
      <Typography className={classes.title}>買い物リスト</Typography>
      <form onSubmit={handleAddItem}>
        <Box className={classes.formControl}>
          <TextField
            label="アイテム名"
            variant="outlined"
            fullWidth
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <Select
            fullWidth
            id="itemPriority"
            className={classes.select}
            value={itemPriority}
            onChange={(e) => setItemPriority(e.target.value as '必須' | 'いつか買う')}
          >
            <MenuItem value="必須">必須</MenuItem>
            <MenuItem value="いつか買う">いつか買う</MenuItem>
          </Select>
        </Box>
        <Button variant="contained" color="primary" type="submit" fullWidth>追加</Button>
      </form>

      <Paper className={classes.bulkAddContainer}>
        <TextareaAutosize
          minRows={3}
          placeholder="複数のアイテムを入力（句読点や改行で区切る）"
          style={{ width: '100%' }}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleBulkAdd} fullWidth className={classes.button}>一括追加</Button>
      </Paper>

      <div>
        {items.map((item, index) => (
          <div key={index} className={classes.item}>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleCheckItem(index)}
            />
            <span className={item.checked ? classes.checkedItem : ''}>
              {item.name} ({item.priority})
            </span>
          </div>
        ))}
      </div>
      <Button variant="contained" color="secondary" onClick={handleShare}>URLをコピー</Button>
      <ToastContainer />
    </Container>
  );
}

export default App;