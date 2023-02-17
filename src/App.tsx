import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { GET_DATA } from "./API/";
import type { TableProps } from "antd";
import { Button, Space, Table } from "antd";
import type {
  ColumnsType,
  FilterValue,
  SorterResult,
} from "antd/es/table/interface";
import _ from "lodash";

interface DataType {
  key: string;
  body: string;
  id: number;
  title: string;
  userId: number;
}

function App() {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modifiedData, setModifiedData] = useState<DataType[]>([]);
  const [filterText, setFilterText] = useState<string>("");
  const [fixData, setFixData] = useState<DataType[]>([]);
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<DataType>>({});

  const handleChange: TableProps<DataType>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    console.log("Various parameters", pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  // const controller = new AbortController();
  const fetchData = async () => {
    try {
      const res = await axios.get(GET_DATA);

      setData(res.data);
      setFixData(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("effect");
    setLoading(true);
    fetchData();

    //* useEffect cleanUp Function;
    // return () => controller.abort();
  }, []);

  useEffect(() => {
    const dataList: DataType[] | any = data.map((item, index) => ({
      key: index + 1,
      body: item?.body,
      id: item.id,
      title: item.title,
      userId: item.userId,
    }));

    setModifiedData([...dataList]);
  }, [filterText]);

  const filterData =
    (data: DataType[]) => (formatter: (arg0: DataType) => any) =>
      modifiedData.map((item) => ({
        text: formatter(item),
        value: formatter(item),
      }));

  const handleSearchFilter = (e: React.FormEvent<HTMLInputElement> | any) => {
    setFilterText(e.target.value);

    if (filterText !== "") {
      const filteredData = fixData.filter((data) => {
        return (
          data?.id.toString()?.includes(filterText) ||
          data?.title?.toLowerCase().includes(filterText.toLowerCase()) ||
          data?.userId.toString()?.includes(filterText) ||
          data?.body?.toLowerCase().includes(filterText.toLowerCase())
        );
      });
      console.log(filteredData);
      setData([...filteredData]);
    }
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Body",
      dataIndex: "body",
      key: "body",
      filters: _.uniqWith(
        filterData(modifiedData)((i) => i.body),
        _.isEqual
      ),
      filteredValue: filteredInfo.body || null,
      onFilter: (value: any, record) => record.body.includes(value),
      sorter: (a, b) => a.body.localeCompare(b.body),
      sortOrder: sortedInfo.columnKey === "body" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      sortOrder: sortedInfo.columnKey === "id" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "title",
      dataIndex: "title",
      key: "title",
      filters: _.uniqWith(
        filterData(modifiedData)((i) => i.title),
        _.isEqual
      ),
      filteredValue: filteredInfo.title || null,
      onFilter: (value: number | string | boolean, record: any) =>
        record.title.includes(value),
      sorter: (a, b) => a.title.length - b.title.length,
      sortOrder: sortedInfo.columnKey === "title" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "userId",
      dataIndex: "userId",
      key: "userId",
      sorter: (a, b) => a.userId - b.userId,
      sortOrder: sortedInfo.columnKey === "userId" ? sortedInfo.order : null,
      ellipsis: true,
    },
  ];

  return (
    <>
      <div className="my-3 flex flex-row gap-5">
        <Button onClick={clearFilters}>Clear filters</Button>
        <Button onClick={clearAll}>Clear filters and sorters</Button>
        <input
          className="border-1 rounded bg-gray-200 h-8"
          onChange={handleSearchFilter}
          placeholder="Search"
        />
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={data}
        onChange={handleChange}
        className="flex w-full border-3 shadow-md"
      />
    </>
  );
}

export default App;
