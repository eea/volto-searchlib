import React from 'react';
import { StringList, Icon } from '@eeacms/search/components';
import { useSearchContext } from '@eeacms/search/lib/hocs';

const ContentClusters = ({ clusters, item }) => {
  const context = useSearchContext();
  const clusterFilter = context.filters?.find((f) => f.field === 'op_cluster');
  const activeCluster = clusterFilter?.values?.[0];
  const displayClusters = activeCluster
    ? { [activeCluster]: { ...clusters[activeCluster] } }
    : clusters;

  const format = Array.isArray(item.format?.raw)
    ? item.format?.raw
    : [item.format?.raw];
  const formats_to_show = [];
  if (format.includes('application/msword')) {
    formats_to_show.push('DOC');
  }
  if (
    format.includes(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
  ) {
    formats_to_show.push('DOCX');
  }
  if (format.includes('application/pdf')) {
    formats_to_show.push('PDF');
  }
  return Object.entries(displayClusters).map(
    ([clusterName, cluster], index) => {
      // protect against async cluster information not filled in yet
      return Object.keys(cluster).length ? (
        <div className="tags-wrapper" key={index}>
          {/* <span className="cluster-icon">
            <Icon {...cluster.icon} />
          </span> */}
          <div className="tags">
            <StringList value={clusterName} />
            {clusterName !== cluster.content_types?.[0] && (
              <>
                <Icon name="angle right" />
                <StringList
                  value={displayClusters[clusterName].content_types}
                />
              </>
            )}
            {index < Object.keys(displayClusters).length - 1 ? ', ' : ''}
            {formats_to_show.map((format_to_show, i) => {
              return (
                <span key={i} className="fileformat-icon">
                  {format_to_show}
                </span>
              );
            })}
          </div>
        </div>
      ) : null;
    },
  );
};
export default ContentClusters;
