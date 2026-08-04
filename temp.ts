          const newActivities = [];
          if (typesCount['police'] > 0) newActivities.push('Poliția securizează perimetrul și legitimează persoanele.');
          if (typesCount['swat'] > 0) newActivities.push('SIAS a pătruns în forță și neutralizează amenințarea.');
          if (typesCount['gendarmerie'] > 0) newActivities.push('Jandarmeria restabilește ordinea publică.');
          if (typesCount['fire'] > 0) newActivities.push('Pompierii au desfășurat furtunurile și intervin pentru stingere.');
          if (typesCount['ambulance'] > 0) newActivities.push('Echipajul medical acordă primul ajutor victimelor.');
          
          incident.activities = newActivities;
          stateChanged = true;
        } else {
          if (incident.complication && !incident.complication.resolved) {
            // Blocked by complication
          } else {
            incident.resolutionProgress! += 2; // +2% per tick (10 ticks/sec => 5 seconds to resolve)
            stateChanged = true;
            
            // Random chance for complication
            if (incident.resolutionProgress! > 40 && incident.resolutionProgress! < 60 && !incident.escalated && Math.random() < 0.2) {
               incident.escalated = true;
               if (Math.random() < 0.5) {
                 const possibleBackup: UnitType[] = ['police', 'ambulance', 'fire'];
                 const extraType = possibleBackup[Math.floor(Math.random() * possibleBackup.length)];
                 incident.requiredUnits.push(extraType);
                 incident.complication = {
                   message: `Situația a escaladat! Avem nevoie urgent de un echipaj suplimentar de ${extraType.toUpperCase()}.`,
                   actionLabel: 'Confirmă',
                   resolved: true 
                 };
                 incident.isResolving = false;
                 incident.activities.unshift(`Situația a escaladat! Mai e nevoie de 1 x ${extraType.toUpperCase()}.`);
                 addLog(`Escaladare la ${incident.name}: E nevoie de 1x ${extraType.toUpperCase()}`, 'warning');
               } else {
                 incident.complication = {
                   message: 'Este necesară autorizarea dispeceratului pentru proceduri speciale.',
                   actionLabel: 'Aprobă Procedura (€1000)',
                   resolved: false
                 };
                 incident.activities.unshift('Se așteaptă decizia dispeceratului...');
                 addLog(`Atenție! Este necesară decizia ta la ${incident.name}`, 'warning');
               }
            }

            if (incident.resolutionProgress! >= 100) {
            incident.resolved = true;
            incident.activities = ['Incidentul a fost soluționat. Unitățile se retrag.'];
            
            gameState.resolvedCountTotal++;
            gameState.budget += incident.reward;
            gameState.reputation = Math.min(100, gameState.reputation + 2); // gain 2 rep
            addLog(`Incident Soluționat: ${incident.name} (+${incident.reward} RON, +2 Reputație)`, 'success');
            if (incident.primaryOperator) {
              gameState.resolvedCountPerOperator[incident.primaryOperator] = (gameState.resolvedCountPerOperator[incident.primaryOperator] || 0) + 1;
            }
            
            // Transport suspects/patients and return to base
            incident.assignedUnits.forEach(uid => {
              const unit = gameState.units[uid];
              if (unit) {
                unit.state = 'transporting';
                unit.targetIncidentId = null;

                let targetBase = { id: '', location: { lat: 0, lng: 0 } };
                if (unit.type === 'ambulance') {
                   let nearest = hospitals[0];
                   let minDist = Infinity;
                   for (const st of hospitals) {
                      const d = Math.pow(st.location.lat - unit.location.lat, 2) + Math.pow(st.location.lng - unit.location.lng, 2);
                      if (d < minDist) { minDist = d; nearest = st; }
                   }
                   targetBase = nearest;
                } else if (unit.type === 'fire') {
                   let nearest = fireStations[0];
                   let minDist = Infinity;
                   for (const st of fireStations) {
                      const d = Math.pow(st.location.lat - unit.location.lat, 2) + Math.pow(st.location.lng - unit.location.lng, 2);
                      if (d < minDist) { minDist = d; nearest = st; }
                   }
                   targetBase = nearest;
                } else {
                   let nearest = policeStations[0];
                   let minDist = Infinity;
                   for (const st of policeStations) {
                      const d = Math.pow(st.location.lat - unit.location.lat, 2) + Math.pow(st.location.lng - unit.location.lng, 2);
                      if (d < minDist) { minDist = d; nearest = st; }
                   }
                   targetBase = nearest;
                }

                unit.targetStationId = targetBase.id;
                
                // Find route to station in background (or fallback to straight line in next tick)
                if (unit.type === 'helicopter') {
                   unit.route = [];
                } else {
                   getRoute(unit.location, targetBase.location).then(route => {
                     if (unit.state === 'transporting' && unit.targetStationId === targetBase.id) {
                       unit.route = route;
                     }
                   });
                }
              }
            });
            
            // Remove incident after 3 seconds
            setTimeout(() => {
              const reward = incidentTypes.find(t => t.type === incident.type && t.name === incident.name)?.reward || 1000;
              gameState.budget += reward;
              delete gameState.incidents[incident.id];
            }, 3000);
          }
        }
      } else {
        if (incident.isResolving) {
          incident.isResolving = false;
          incident.activities = ['Unitățile necesare au părăsit zona, se așteaptă întăriri!'];
          stateChanged = true;
        }
      }
