import React, { useState, useMemo, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Space,
  Typography,
  Popconfirm,
  message,
  ConfigProvider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

const initialData = [
  { key: '1', name: 'Проект "Альфа"', date: dayjs('2023-10-01'), value: 15000 },
  { key: '2', name: 'Задача "Бета"', date: dayjs('2023-11-15'), value: 4500 },
  { key: '3', name: 'Отчет "Гамма"', date: dayjs('2023-09-20'), value: 8200 },
  { key: '4', name: 'Аудит "Дельта"', date: dayjs('2023-12-05'), value: 12000 },
  { key: '5', name: 'План "Эпсилон"', date: dayjs('2024-01-10'), value: 23000 },
];

export const DataTable = () => {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const searchInputRef = useRef(null);

  const openModal = (record) => {
    if (record) {
      setEditingKey(record.key);
      form.setFieldsValue({
        name: record.name,
        date: record.date,
        value: record.value,
      });
    } else {
      setEditingKey(null);
      form.resetFields();
      form.setFieldsValue({ date: dayjs() });
    }
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingKey) {
        setData(prev =>
          prev.map(item =>
            item.key === editingKey ? { ...item, ...values } : item
          )
        );
        message.success('Запись обновлена');
      } else {
        const newRecord = {
          key: Date.now().toString(),
          ...values,
        };
        setData(prev => [...prev, newRecord]);
        message.success('Запись добавлена');
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.log('Ошибка валидации:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (key) => {
    setData(prev => prev.filter(item => item.key !== key));
    message.success('Запись удалена');
  };

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return data;

    const search = searchText.toLowerCase();
    return data.filter(item => {
      return (
        item.name.toLowerCase().includes(search) ||
        item.date.format('DD.MM.YYYY').includes(search) ||
        item.value.toString().includes(search)
      );
    });
  }, [data, searchText]);

  const columns = [
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, 'ru'),
      showSorterTooltip: { title: 'Сортировать по имени' },
      ellipsis: true,
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (date) => date.format('DD.MM.YYYY'),
      sorter: (a, b) => a.date.valueOf() - b.date.valueOf(),
      showSorterTooltip: { title: 'Сортировать по дате' },
    },
    {
      title: 'Значение',
      dataIndex: 'value',
      key: 'value',
      sorter: (a, b) => a.value - b.value,
      showSorterTooltip: { title: 'Сортировать по значению' },
      render: (val) => val.toLocaleString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            size="small"
            title="Редактировать"
          />
          <Popconfirm
            title="Удалить запись?"
            description="Вы уверены, что хотите удалить эту строку?"
            onConfirm={() => handleDelete(record.key)}
            okText="Да"
            cancelText="Нет"
            placement="left"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Удалить"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      locale={{
        locale: 'ru',
        Pagination: {
          items_per_page: 'на стр.',
          jump_to: 'Перейти',
          page: 'Страница',
        },
        Table: {
          filterConfirm: 'OK',
          filterReset: 'Сбросить',
          emptyText: 'Нет данных',
        },
        DatePicker: {
          lang: {
            locale: 'ru',
            placeholder: 'Выберите дату',
            rangePlaceholder: ['Начало', 'Конец'],
          },
        },
      }}
    >
      <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        <Typography.Title level={2} style={{ marginBottom: 24, textAlign: 'center' }}>
          Управление данными
        </Typography.Title>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <Input
            ref={searchInputRef}
            placeholder="Поиск по всем полям..."
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)', fontSize: 16 }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 320, maxWidth: '100%' }}
            allowClear
            size="large"
            onPressEnter={() => searchInputRef.current?.blur()}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            size="large"
            style={{ borderRadius: 8 }}
          >
            Добавить запись
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="key"
          size="middle"
          scroll={{ x: true }}
          sortDirections={['descend', 'ascend']}
          locale={{
            emptyText: 'Нет данных для отображения',
            filterConfirm: 'Применить',
            filterReset: 'Сбросить',
          }}
        />

        <Modal
          title={
            <Space>
              {editingKey ? <EditOutlined /> : <PlusOutlined />}
              {editingKey ? 'Редактировать запись' : 'Добавить новую запись'}
            </Space>
          }
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText="Сохранить"
          cancelText="Отмена"
          width={500}
          destroyOnClose
          maskClosable={false}
        >
          <Form
            form={form}
            layout="vertical"
            name="data_form"
            initialValues={{ date: dayjs() }}
          >
            <Form.Item
              name="name"
              label="Имя / Название"
              rules={[
                { required: true, message: 'Пожалуйста, введите имя!' },
                { min: 2, message: 'Минимум 2 символа' },
                { max: 100, message: 'Максимум 100 символов' }
              ]}
            >
              <Input placeholder="Например: Проект А" maxLength={100} />
            </Form.Item>

            <Form.Item
              name="date"
              label="Дата события"
              rules={[{ required: true, message: 'Пожалуйста, выберите дату!' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD.MM.YYYY"
                placeholder="Выберите дату"
              />
            </Form.Item>

            <Form.Item
              name="value"
              label="Числовое значение"
              rules={[
                { required: true, message: 'Пожалуйста, введите число!' },
                { type: 'number', min: 0, message: 'Значение не может быть отрицательным' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="0"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                }
                parser={(value) => value?.replace(/\s/g, '')
                }
              />
            </Form.Item>
          </Form>
        </Modal>

      </div>
    </ConfigProvider>
  );
};

export default DataTable;