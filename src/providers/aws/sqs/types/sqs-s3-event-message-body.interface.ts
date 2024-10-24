export interface ISqsMessageBody {
  Records: {
    eventVersion: string;
    eventSource: string;
    awsRegion: string;
    eventTime: string;
    eventName: string;
    s3: IS3Event;
  }[];
}

export interface IS3Event {
  s3SchemaVersion: string;
  configurationId: string;
  bucket: {
    name: string;
    ownerIdentity: {
      principalId: string;
    };
    arn: string;
  };
  object: {
    key: string;
    size: number;
    eTag: string;
    versionId: string;
    sequencer: string;
  };
}
