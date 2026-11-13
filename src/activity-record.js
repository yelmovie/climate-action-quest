export const sourceActivityRecord = record =>
  record?.workComplete === false && record?.earnedRecord ? record.earnedRecord : record || {};
