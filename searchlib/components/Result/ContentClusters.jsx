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
            {format.includes('application/pdf') ? (
              <span className="pdf-icon">PDF</span>
            ) : (
              ''
            )}
          </div>
        </div>
      ) : null;
    },
  );
};
export default ContentClusters;
